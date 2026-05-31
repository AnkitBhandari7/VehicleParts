using VehicleParts.Domain.Models;

namespace VehicleParts.Application.Interface.IRepository;

public interface ICustomerHistoryRepository
{
    Task<CustomerDetail?> GetCustomerByIdAsync(int customerId);
    Task<IEnumerable<Invoice>> GetPurchaseHistoryAsync(int customerId);
    Task<IEnumerable<Appointment>> GetServiceHistoryAsync(int customerId);
}