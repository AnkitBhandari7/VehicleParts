using VehicleParts.Application.DTOs;

namespace VehicleParts.Application.Interface.IServices;

public interface ICustomerHistoryService
{
    Task<CustomerFullHistoryDto?> GetFullHistoryAsync(int customerId);
    Task<IEnumerable<CustomerPurchaseHistoryDto>> GetPurchaseHistoryAsync(int customerId);
    Task<IEnumerable<CustomerServiceHistoryDto>> GetServiceHistoryAsync(int customerId);
}