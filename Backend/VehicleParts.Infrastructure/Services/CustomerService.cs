using System.Security.Cryptography;
using System.Text;
using VehicleParts.Application.DTOs;
using VehicleParts.Application.Interface.IRepository;
using VehicleParts.Application.Interface.IServices;
using VehicleParts.Domain.Models;

namespace VehicleParts.Infrastructure.Services;

public class CustomerService : ICustomerService
{
    private readonly ICustomerRepository _customerRepository;

    public CustomerService(ICustomerRepository customerRepository)
    {
        _customerRepository = customerRepository;
    }

    public async Task<IEnumerable<CustomerResponseDto>> GetAllCustomersAsync()
    {
        var customers = await _customerRepository.GetAllAsync();
        return customers.Select(MapToDto);
    }

    public async Task<CustomerResponseDto?> GetCustomerByIdAsync(int id)
    {
        var customer = await _customerRepository.GetByIdAsync(id);
        return customer is null ? null : MapToDto(customer);
    }

    public async Task<CustomerResponseDto> RegisterCustomerAsync(RegisterCustomerDto dto)
    {
        if (await _customerRepository.EmailExistsAsync(dto.Email))
            throw new InvalidOperationException("A user with this email address already exists.");

        var user = new User
        {
            Email        = dto.Email.Trim().ToLower(),
            PasswordHash = HashPassword(dto.Password),
            Role         = "Customer",
            IsActive     = true
        };

        var customer = new CustomerDetail
        {
            FirstName   = dto.FirstName.Trim(),
            LastName    = dto.LastName.Trim(),
            Phone       = dto.Phone.Trim(),
            Address     = dto.Address.Trim(),
            DateOfBirth = dto.DateOfBirth
        };

        var created = await _customerRepository.CreateAsync(user, customer);

        // Reload to include User and Vehicles navigation properties
        var result = await _customerRepository.GetByIdAsync(created.CustomerID);
        return MapToDto(result!);
    }

    public async Task<VehicleResponseDto> AddVehicleAsync(int customerId, AddVehicleDto dto)
    {
        if (!await _customerRepository.CustomerExistsAsync(customerId))
            throw new KeyNotFoundException($"Customer with ID {customerId} was not found.");

        var vehicle = new Vehicle
        {
            CustomerID    = customerId,
            VehicleNumber = dto.VehicleNumber.Trim(),
            Make          = dto.Make.Trim(),
            Model         = dto.Model.Trim(),
            Year          = dto.Year.Trim(),
            Color         = dto.Color.Trim(),
            Notes         = dto.Notes.Trim(),
            VIN           = dto.VIN.Trim()
        };

        var created = await _customerRepository.AddVehicleAsync(vehicle);
        return MapVehicleToDto(created);
    }

    public async Task<IEnumerable<VehicleResponseDto>> GetVehiclesByCustomerAsync(int customerId)
    {
        var vehicles = await _customerRepository.GetVehiclesByCustomerAsync(customerId);
        return vehicles.Select(MapVehicleToDto);
    }

    // Stores password as "salt:hash" using SHA-256. The salt is a random GUID.
    private static string HashPassword(string password)
    {
        var salt  = Guid.NewGuid().ToString("N");
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(salt + password));
        return $"{salt}:{Convert.ToBase64String(bytes)}";
    }

    private static CustomerResponseDto MapToDto(CustomerDetail c) => new()
    {
        CustomerID   = c.CustomerID,
        UserID       = c.UserID,
        Email        = c.User?.Email ?? string.Empty,
        FirstName    = c.FirstName,
        LastName     = c.LastName,
        Phone        = c.Phone,
        Address      = c.Address,
        DateOfBirth  = c.DateOfBirth,
        TotalSpent   = c.TotalSpent,
        LoyaltyPoints = c.LoyaltyPoints,
        CreditBalance = c.CreditBalance,
        CreditStatus = c.CreditStatus,
        TotalVisits  = c.TotalVisits,
        RegisteredAt = c.RegisteredAt,
        Vehicles     = c.Vehicles.Select(MapVehicleToDto).ToList()
    };

    private static VehicleResponseDto MapVehicleToDto(Vehicle v) => new()
    {
        VehicleID     = v.VehicleID,
        CustomerID    = v.CustomerID,
        VehicleNumber = v.VehicleNumber,
        Make          = v.Make,
        Model         = v.Model,
        Year          = v.Year,
        Color         = v.Color,
        Notes         = v.Notes,
        VIN           = v.VIN,
        CreatedAt     = v.CreatedAt
    };

    public async Task<List<CustomerSearchResultDto>> SearchCustomersAsync(CustomerSearchType type, string? query, CancellationToken ct)
    {
        var list = await _customerRepository.SearchAsync(type, query, ct);
        return list.Select(c => new CustomerSearchResultDto
        {
            Id = c.CustomerID,
            FullName = $"{c.FirstName} {c.LastName}",
            PhoneNumber = c.Phone,
            Email = c.User?.Email ?? string.Empty,
            VehiclePlateNumbers = c.Vehicles.Select(v => v.VehicleNumber).ToList()
        }).ToList();
    }

    public async Task<CustomerResponseDto?> UpdateCustomerAsync(int id, UpdateCustomerDto dto)
    {
        var customer = await _customerRepository.GetByIdAsync(id);
        if (customer == null) return null;

        if (dto.DateOfBirth < new DateTime(1753, 1, 1))
        {
            throw new InvalidOperationException("Date of birth must be a valid date after January 1, 1753.");
        }

        customer.FirstName = dto.FirstName.Trim();
        customer.LastName = dto.LastName.Trim();
        customer.Phone = dto.Phone.Trim();
        customer.Address = dto.Address.Trim();
        customer.DateOfBirth = dto.DateOfBirth;

        await _customerRepository.UpdateAsync(customer);
        return MapToDto(customer);
    }
}

