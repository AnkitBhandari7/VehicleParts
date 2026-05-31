using Microsoft.EntityFrameworkCore;
using VehicleParts.Application.DTOs;
using VehicleParts.Application.Interface.IServices;
using VehicleParts.Infrastructure.Persistance;

namespace VehicleParts.Infrastructure.Services;

// Feature 1 - Financial Report Service
// this class reads invoice data from the database and calculates financial numbers
public class FinancialReportService : IFinancialReportService
{
    private readonly AppDbContext _db;

    public FinancialReportService(AppDbContext db)
    {
        _db = db;
    }

    // get the full financial report for a given date range
    public async Task<FinancialReportDto> GetFinancialReportAsync(DateTime? from, DateTime? to)
    {
        // set default date range if not provided
        var fromDate = from ?? DateTime.UtcNow.AddYears(-1);
        var toDate = to ?? DateTime.UtcNow;

        // Ensure dates are marked as UTC to prevent Npgsql 500 timezone issues (Kind=Unspecified)
        if (fromDate.Kind != DateTimeKind.Utc)
        {
            fromDate = DateTime.SpecifyKind(fromDate, DateTimeKind.Utc);
        }
        if (toDate.Kind != DateTimeKind.Utc)
        {
            toDate = DateTime.SpecifyKind(toDate, DateTimeKind.Utc);
        }

        // get all invoices within the date range
        var invoices = await _db.Invoices
            .Where(i => i.CreatedAt >= fromDate && i.CreatedAt <= toDate)
            .ToListAsync();

        // calculate the summary numbers
        var summary = new FinancialSummaryDto
        {
            TotalInvoices = invoices.Count,
            PaidInvoices = invoices.Count(i => i.IsPaid),
            UnpaidInvoices = invoices.Count(i => !i.IsPaid),

            // only count revenue from paid invoices
            TotalRevenue = invoices.Where(i => i.IsPaid).Sum(i => i.TotalAmount),

            // count unique customers
            TotalCustomers = invoices.Select(i => i.CustomerID).Distinct().Count(),

            // average value per invoice
            AverageInvoiceValue = invoices.Count > 0
                ? invoices.Average(i => i.TotalAmount)
                : 0
        };

        // get monthly breakdown
        var monthly = await GetMonthlyBreakdownAsync(fromDate, toDate);

        // get top 5 parts
        var topParts = await GetTopPartsAsync(5);

        return new FinancialReportDto
        {
            Summary = summary,
            MonthlyRevenue = monthly,
            TopParts = topParts,
            FromDate = fromDate,
            ToDate = toDate
        };
    }

    // get revenue grouped by month for a specific year
    public async Task<List<MonthlyRevenueDto>> GetMonthlyRevenueAsync(int year)
    {
        // get all paid invoices for that year
        var invoices = await _db.Invoices
            .Where(i => i.CreatedAt.Year == year && i.IsPaid)
            .ToListAsync();

        // group by month and calculate totals
        var monthlyData = invoices
            .GroupBy(i => i.CreatedAt.Month)
            .Select(g => new MonthlyRevenueDto
            {
                Year = year,
                Month = g.Key,
                MonthName = new DateTime(year, g.Key, 1).ToString("MMMM"),
                Revenue = g.Sum(i => i.TotalAmount),
                InvoiceCount = g.Count()
            })
            .OrderBy(m => m.Month)
            .ToList();

        return monthlyData;
    }

    // get the top N best-selling parts by total revenue
    public async Task<List<TopPartDto>> GetTopPartsAsync(int topCount)
    {
        // join invoice items with parts to get sales data
        var topParts = await _db.InvoiceItems
            .Include(ii => ii.Part)
            .Include(ii => ii.Invoice)
            .Where(ii => ii.Invoice.IsPaid)
            .GroupBy(ii => new { ii.PartID, ii.Part.Name, ii.Part.Category })
            .Select(g => new TopPartDto
            {
                PartID = g.Key.PartID,
                PartName = g.Key.Name,
                Category = g.Key.Category,
                TotalQuantitySold = g.Sum(ii => ii.Quantity),
                TotalRevenue = g.Sum(ii => ii.LineTotal)
            })
            .OrderByDescending(p => p.TotalRevenue)
            .Take(topCount)
            .ToListAsync();

        return topParts;
    }

    // helper method for monthly breakdown within a date range
    private async Task<List<MonthlyRevenueDto>> GetMonthlyBreakdownAsync(DateTime from, DateTime to)
    {
        var invoices = await _db.Invoices
            .Where(i => i.CreatedAt >= from && i.CreatedAt <= to && i.IsPaid)
            .ToListAsync();

        var monthlyData = invoices
            .GroupBy(i => new { i.CreatedAt.Year, i.CreatedAt.Month })
            .Select(g => new MonthlyRevenueDto
            {
                Year = g.Key.Year,
                Month = g.Key.Month,
                MonthName = new DateTime(g.Key.Year, g.Key.Month, 1).ToString("MMMM"),
                Revenue = g.Sum(i => i.TotalAmount),
                InvoiceCount = g.Count()
            })
            .OrderBy(m => m.Year)
            .ThenBy(m => m.Month)
            .ToList();

        return monthlyData;
    }
}
