using VehicleParts.Domain.Models;

namespace VehicleParts.Application.Interface.IRepository;

public interface ILoyaltyRepository
{
    Task<CustomerDetail?> GetCustomerByIdAsync(int customerId);
    Task<IEnumerable<LoyaltyTransaction>> GetTransactionsByCustomerIdAsync(int customerId);
}