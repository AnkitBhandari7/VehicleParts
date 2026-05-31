namespace VehicleParts.Application.DTOs;

// ---------- REQUEST DTOs ----------

public class CreateInvoiceRequestDto
{
    public int CustomerID { get; set; }
    public int StaffID { get; set; }

    /// <summary>
    /// "Sale" or "Service"
    /// </summary>
    public string Type { get; set; } = "Sale";

    public bool IsCreditSale { get; set; } = false;
    public DateTime? DueDate { get; set; }
    public string Notes { get; set; } = string.Empty;

    public List<InvoiceItemRequestDto> Items { get; set; } = new();
}

public class InvoiceItemRequestDto
{
    public int PartID { get; set; }
    public int Quantity { get; set; }
}

// ---------- RESPONSE DTOs ----------

public class InvoiceResponseDto
{
    public int InvoiceID { get; set; }
    public int CustomerID { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public int StaffID { get; set; }
    public string StaffName { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public decimal SubTotal { get; set; }
    public decimal DiscountPercent { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public bool LoyaltyDiscountApplied { get; set; }
    public bool IsPaid { get; set; }
    public bool IsCreditSale { get; set; }
    public DateTime? DueDate { get; set; }
    public string Notes { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public List<InvoiceItemResponseDto> Items { get; set; } = new();
}

public class InvoiceItemResponseDto
{
    public int PartID { get; set; }
    public string PartName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal LineTotal { get; set; }
}