namespace VehicleParts.Application.DTOs;

public class LowStockPartDto
{
    public int PartID { get; set; }
    public string Name { get; set; } = string.Empty;
    public string PartNumber { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public int Stock { get; set; }
    public int LowStockThreshold { get; set; }
    public string VendorName { get; set; } = string.Empty;
}