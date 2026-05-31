namespace VehicleParts.Application.DTOs;

public class OverdueCreditDto
{
    public int CustomerID { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public decimal CreditBalance { get; set; }
    public string CreditStatus { get; set; } = string.Empty;
    public DateTime? LastCreditReminderSent { get; set; }
}