namespace VehicleParts.Application.Interface.IServices;

using VehicleParts.Application.DTOs;

public interface ICustomerReportService
{
    Task<IEnumerable<CustomerReportDto>> GetRegularCustomersAsync(int topCount);
    Task<IEnumerable<CustomerReportDto>> GetHighSpendersAsync(int topCount);
    Task<IEnumerable<CustomerReportDto>> GetPendingCreditCustomersAsync();
}