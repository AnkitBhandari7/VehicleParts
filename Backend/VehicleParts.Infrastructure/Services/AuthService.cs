using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using VehicleParts.Application.DTOs;
using VehicleParts.Application.Interface.IRepository;
using VehicleParts.Application.Interface.IServices;

namespace VehicleParts.Infrastructure.Services;

// this service handles logging in - it checks the password and creates the JWT token
public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepo;
    private readonly IConfiguration  _config;

    public AuthService(IUserRepository userRepo, IConfiguration config)
    {
        _userRepo = userRepo;
        _config   = config;
    }

    // check the user's email and password and return a token if correct
    public async Task<LoginResponseDto?> LoginAsync(LoginRequestDto dto)
    {
        // step 1: find the user by their email in the database
        var user = await _userRepo.GetByEmailAsync(dto.Email);

        // if no user found or they are deactivated, return null (login failed)
        if (user == null || !user.IsActive)
            return null;

        // step 2: check if the password they typed matches the hashed password in the database
        bool passwordCorrect = VerifyPassword(dto.Password, user.PasswordHash);
        if (!passwordCorrect)
            return null;

        // step 3: build the JWT token so the frontend can use it for future requests
        var jwtSection  = _config.GetSection("Jwt");
        var key         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSection["Key"]!));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiry      = DateTime.UtcNow.AddMinutes(int.Parse(jwtSection["ExpMinutes"]!));

        // the token contains the user's ID, email, and role so the API knows who they are
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.UserID.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role)
        };

        var token = new JwtSecurityToken(
            issuer:             jwtSection["Issuer"],
            audience:           jwtSection["Audience"],
            claims:             claims,
            expires:            expiry,
            signingCredentials: credentials
        );

        // step 4: return the token and user info to the frontend
        return new LoginResponseDto
        {
            Token     = new JwtSecurityTokenHandler().WriteToken(token),
            Email     = user.Email,
            FullName  = user.CustomerDetail != null
                        ? $"{user.CustomerDetail.FirstName} {user.CustomerDetail.LastName}".Trim()
                        : user.StaffDetail != null
                          ? $"{user.StaffDetail.FirstName} {user.StaffDetail.LastName}"
                          : user.Email,
            Role      = user.Role,
            ExpiresAt = expiry,
            // Include CustomerId for Customer role so frontend can fetch appointments, reviews etc.
            CustomerId = user.CustomerDetail?.CustomerID
        };
    }

    // register a new customer account
    public async Task<bool> RegisterAsync(RegisterRequestDto dto)
    {
        // check if user already exists
        var existingUser = await _userRepo.GetByEmailAsync(dto.Email);
        if (existingUser != null)
            return false;

        // create the new user as a Customer
        var newUser = new VehicleParts.Domain.Models.User
        {
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = "Customer",
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            // we create a customer profile automatically
            CustomerDetail = new VehicleParts.Domain.Models.CustomerDetail
            {
                FirstName = dto.FullName,
                Phone = dto.Phone,
                RegisteredAt = DateTime.UtcNow
            }
        };

        await _userRepo.AddAsync(newUser);
        await _userRepo.SaveChangesAsync();
        
        return true;
    }

    private bool VerifyPassword(string enteredPassword, string storedHash)
    {
        // 1. Check if the stored hash is in the GUID-salted SHA256 format "salt:hash" (used by staff-registered customers)
        if (storedHash.Contains(':'))
        {
            var parts = storedHash.Split(':');
            if (parts.Length == 2)
            {
                var salt = parts[0];
                var hash = parts[1];
                using (var sha256 = System.Security.Cryptography.SHA256.Create())
                {
                    var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(salt + enteredPassword));
                    var computedHash = Convert.ToBase64String(bytes);
                    return computedHash == hash;
                }
            }
        }

        // 2. Fall back to BCrypt (used by self-registered customers & admin/staff accounts)
        try
        {
            return BCrypt.Net.BCrypt.Verify(enteredPassword, storedHash);
        }
        catch
        {
            return false;
        }
    }
}
