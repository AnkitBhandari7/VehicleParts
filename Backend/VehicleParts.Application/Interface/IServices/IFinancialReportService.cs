using VehicleParts.Application.DTOs;

namespace VehicleParts.Application.Interface.IServices;

// this is the contract for Feature 1 - Financial Reporting

public interface IFinancialReportService
{
    Task<FinancialReportDto> GetFinancialReportAsync(DateTime? from, DateTime? to);

   
    Task<List<MonthlyRevenueDto>> GetMonthlyRevenueAsync(int year);

    Task<List<TopPartDto>> GetTopPartsAsync(int topCount);
}
