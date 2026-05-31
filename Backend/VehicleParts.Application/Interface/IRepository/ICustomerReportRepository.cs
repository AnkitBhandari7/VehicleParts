namespace VehicleParts.Application.Interface.IRepository;

using VehicleParts.Domain.Models;

public interface ICustomerReportRepository
{
    Task<IEnumerable<CustomerDetail>> GetRegularCustomersAsync(int topCount);
    Task<IEnumerable<CustomerDetail>> GetHighSpendersAsync(int topCount);
    Task<IEnumerable<CustomerDetail>> GetPendingCreditCustomersAsync();
}