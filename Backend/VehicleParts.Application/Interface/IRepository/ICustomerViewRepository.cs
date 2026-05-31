namespace VehicleParts.Application.Interface.IRepository;

using VehicleParts.Domain.Models;

public interface ICustomerViewRepository
{
    Task<CustomerDetail?> GetCustomerByIdAsync(int customerId);
    Task<IEnumerable<Vehicle>> GetCustomerVehiclesAsync(int customerId);
    Task<IEnumerable<Invoice>> GetCustomerPurchaseHistoryAsync(int customerId);
}