namespace VehicleParts.Application.DTOs;

// this DTO holds the overall financial summary numbers
public class FinancialSummaryDto
{
    public decimal TotalRevenue { get; set; }
    public int TotalInvoices { get; set; }
    public int PaidInvoices { get; set; }
    public int UnpaidInvoices { get; set; }
    public int TotalCustomers { get; set; }
    public decimal AverageInvoiceValue { get; set; }
}

// this DTO holds revenue broken down by month
public class MonthlyRevenueDto
{
    public int Year { get; set; }
    public int Month { get; set; }
    public string MonthName { get; set; } = string.Empty;
    public decimal Revenue { get; set; }
    public int InvoiceCount { get; set; }
}

// this DTO holds the top selling parts by revenue
public class TopPartDto
{
    public int PartID { get; set; }
    public string PartName { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public int TotalQuantitySold { get; set; }
    public decimal TotalRevenue { get; set; }
}

// this is the full financial report response sent to the frontend
public class FinancialReportDto
{

    public FinancialSummaryDto Summary { get; set; } = new();
    public List<MonthlyRevenueDto> MonthlyRevenue { get; set; } = new();
    public List<TopPartDto> TopParts { get; set; } = new();
    public DateTime FromDate { get; set; }
    public DateTime ToDate { get; set; }
}
