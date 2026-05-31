using System.ComponentModel.DataAnnotations;

namespace VehicleParts.Application.DTOs;

public class CreatePurchaseInvoiceDto
{
    [Required]
    public int VendorID { get; set; }

    [Required]
    public int PartID { get; set; }

    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1.")]
    public int QuantityPurchased { get; set; }

    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Unit cost must be greater than zero.")]
    public decimal UnitCost { get; set; }

    public string Notes { get; set; } = string.Empty;
}

public class PurchaseInvoiceResponseDto
{
    public int PurchaseInvoiceID { get; set; }
    public int VendorID { get; set; }
    public string VendorName { get; set; } = string.Empty;
    public int PartID { get; set; }
    public string PartName { get; set; } = string.Empty;
    public string PartNumber { get; set; } = string.Empty;
    public int QuantityPurchased { get; set; }
    public decimal UnitCost { get; set; }
    public decimal TotalCost { get; set; }
    public int UpdatedStockLevel { get; set; }
    public string Notes { get; set; } = string.Empty;
    public DateTime PurchasedAt { get; set; }
}
