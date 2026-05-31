namespace VehicleParts.Application.DTOs;


// ---------- PURCHASE HISTORY ----------

public class CustomerPurchaseHistoryDto
{
    public int InvoiceID { get; set; }
    public string Type { get; set; } = string.Empty;
    public decimal SubTotal { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public bool LoyaltyDiscountApplied { get; set; }
    public bool IsPaid { get; set; }
    public bool IsCreditSale { get; set; }
    public DateTime? DueDate { get; set; }
    public string Notes { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string StaffName { get; set; } = string.Empty;
    public List<InvoiceItemResponseDto> Items { get; set; } = new();
}

// ---------- SERVICE HISTORY ----------

public class CustomerServiceHistoryDto
{
    public int AppointmentID { get; set; }
    public DateTime AppointmentDate { get; set; }
    public string TimeSlot { get; set; } = string.Empty;
    public string ServiceDescription { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string StaffName { get; set; } = string.Empty;
    public string VehicleNumber { get; set; } = string.Empty;
    public string VehicleMake { get; set; } = string.Empty;
    public string VehicleModel { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public List<ServiceReviewDto> Reviews { get; set; } = new();
}

public class ServiceReviewDto
{
    public int ReviewID { get; set; }
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
    public DateTime ReviewedAt { get; set; }
}

// ---------- COMBINED HISTORY RESPONSE ----------

public class CustomerFullHistoryDto
{
    public int CustomerID { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public decimal TotalSpent { get; set; }
    public int TotalVisits { get; set; }
    public List<CustomerPurchaseHistoryDto> PurchaseHistory { get; set; } = new();
    public List<CustomerServiceHistoryDto> ServiceHistory { get; set; } = new();
}