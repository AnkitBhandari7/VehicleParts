namespace VehicleParts.Application.DTOs;

public class PurchaseHistoryDto
{
    public int InvoiceID { get; set; }
    public decimal SubTotal { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public bool IsPaid { get; set; }
    public bool IsCreditSale { get; set; }
    public bool LoyaltyDiscountApplied { get; set; }
    public DateTime? DueDate { get; set; }
    public string Notes { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public List<PurchaseHistoryItemDto> Items { get; set; } = new();
}

public class PurchaseHistoryItemDto
{
    public string PartName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal LineTotal { get; set; }
}