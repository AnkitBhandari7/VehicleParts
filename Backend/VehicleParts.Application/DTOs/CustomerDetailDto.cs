namespace VehicleParts.Application.DTOs;

public class CustomerDetailDto
{
    public int CustomerID { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
    public decimal TotalSpent { get; set; }
    public int LoyaltyPoints { get; set; }
    public decimal CreditBalance { get; set; }
    public string CreditStatus { get; set; } = string.Empty;
    public int TotalVisits { get; set; }
    public DateTime RegisteredAt { get; set; }
}