namespace VehicleParts.Application.DTOs;

public class CustomerReportDto
{
    public int CustomerID { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public decimal TotalSpent { get; set; }
    public int TotalVisits { get; set; }
    public decimal CreditBalance { get; set; }
    public string CreditStatus { get; set; } = string.Empty;
    public DateTime RegisteredAt { get; set; }
}