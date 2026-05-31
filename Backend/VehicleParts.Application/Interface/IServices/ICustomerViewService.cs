namespace VehicleParts.Application.Interface.IServices;

using VehicleParts.Application.DTOs;

public interface ICustomerViewService
{
    Task<CustomerDetailDto?> GetCustomerByIdAsync(int customerId);
    Task<IEnumerable<CustomerVehicleDto>> GetCustomerVehiclesAsync(int customerId);
    Task<IEnumerable<PurchaseHistoryDto>> GetCustomerPurchaseHistoryAsync(int customerId);
}