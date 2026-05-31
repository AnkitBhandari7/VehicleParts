namespace VehicleParts.Application.DTOs;

// ---------- RESPONSE DTOs ----------

public class LoyaltyTransactionDto
{
    public int ID { get; set; }
    public int CustomerID { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public int InvoiceID { get; set; }
    public int PointsEarned { get; set; }
    public int PointsUsed { get; set; }
    public string Reason { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class CustomerLoyaltySummaryDto
{
    public int CustomerID { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public decimal TotalSpent { get; set; }
    public int LoyaltyPoints { get; set; }
    public string CreditStatus { get; set; } = string.Empty;
    public List<LoyaltyTransactionDto> Transactions { get; set; } = new();
}

public class LoyaltyDiscountCheckDto
{
    public int CustomerID { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public decimal SubTotal { get; set; }
    public bool IsEligibleForDiscount { get; set; }
    public decimal DiscountPercent { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal FinalAmount { get; set; }
    public string Message { get; set; } = string.Empty;
}