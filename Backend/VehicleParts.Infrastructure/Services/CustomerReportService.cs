namespace VehicleParts.Infrastructure.Services;

using VehicleParts.Application.DTOs;
using VehicleParts.Application.Interface.IRepository;
using VehicleParts.Application.Interface.IServices;

public class CustomerReportService : ICustomerReportService
{
    private readonly ICustomerReportRepository _repository;

    public CustomerReportService(ICustomerReportRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<CustomerReportDto>> GetRegularCustomersAsync(int topCount)
    {
        var customers = await _repository.GetRegularCustomersAsync(topCount);
        return customers.Select(MapToDto);
    }

    public async Task<IEnumerable<CustomerReportDto>> GetHighSpendersAsync(int topCount)
    {
        var customers = await _repository.GetHighSpendersAsync(topCount);
        return customers.Select(MapToDto);
    }

    public async Task<IEnumerable<CustomerReportDto>> GetPendingCreditCustomersAsync()
    {
        var customers = await _repository.GetPendingCreditCustomersAsync();
        return customers.Select(MapToDto);
    }

    private static CustomerReportDto MapToDto(VehicleParts.Domain.Models.CustomerDetail c)
    {
        return new CustomerReportDto
        {
            CustomerID = c.CustomerID,
            FirstName = c.FirstName,
            LastName = c.LastName,
            Phone = c.Phone,
            Email = c.User?.Email ?? string.Empty,
            TotalSpent = c.TotalSpent,
            TotalVisits = c.TotalVisits,
            CreditBalance = c.CreditBalance,
            CreditStatus = c.CreditStatus,
            RegisteredAt = c.RegisteredAt
        };
    }
}