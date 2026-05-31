using VehicleParts.Application.DTOs;

namespace VehicleParts.Application.Interface.IServices;

// this is the contract for login and registration
// the actual code is written in Infrastructure/Services/AuthService.cs
public interface IAuthService
{
    // check the user's email and password and return a JWT token if correct
    Task<LoginResponseDto?> LoginAsync(LoginRequestDto dto);

    // register a new customer account
    Task<bool> RegisterAsync(RegisterRequestDto dto);
}
