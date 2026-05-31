using VehicleParts.Domain.Models;
using VehicleParts.Application.DTOs;

namespace VehicleParts.Application.Interface.IRepository;

public interface ICustomerRepository
{
    Task<IEnumerable<CustomerDetail>> GetAllAsync();
    Task<CustomerDetail?> GetByIdAsync(int id);
    Task<bool> EmailExistsAsync(string email);
    Task<CustomerDetail> CreateAsync(User user, CustomerDetail customer);
    Task<Vehicle> AddVehicleAsync(Vehicle vehicle);
    Task<IEnumerable<Vehicle>> GetVehiclesByCustomerAsync(int customerId);
    Task<bool> CustomerExistsAsync(int customerId);
    Task<List<CustomerDetail>> SearchAsync(CustomerSearchType type, string? query, CancellationToken ct);
    Task UpdateAsync(CustomerDetail customer);
}

