using VehicleParts.Application.DTOs;

namespace VehicleParts.Application.Interface.IServices;

public interface ICustomerService
{
    Task<IEnumerable<CustomerResponseDto>> GetAllCustomersAsync();
    Task<CustomerResponseDto?> GetCustomerByIdAsync(int id);
    Task<CustomerResponseDto> RegisterCustomerAsync(RegisterCustomerDto dto);
    Task<VehicleResponseDto> AddVehicleAsync(int customerId, AddVehicleDto dto);
    Task<IEnumerable<VehicleResponseDto>> GetVehiclesByCustomerAsync(int customerId);
    Task<List<CustomerSearchResultDto>> SearchCustomersAsync(CustomerSearchType type, string? query, CancellationToken ct);
    Task<CustomerResponseDto?> UpdateCustomerAsync(int id, UpdateCustomerDto dto);
}

