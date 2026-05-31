namespace VehicleParts.Application.DTOs;

// what the frontend sends when admin adds a new part
public class CreatePartDto
{
    public int     VendorID         { get; set; }
    public string  Name             { get; set; } = string.Empty;
    public string  Description      { get; set; } = string.Empty;
    public string  Category         { get; set; } = string.Empty;
    public string  PartNumber       { get; set; } = string.Empty;
    public decimal Price            { get; set; }
    public int     Stock            { get; set; }
    public int     LowStockThreshold { get; set; } = 5;
}

// what the frontend sends when admin updates a part
public class UpdatePartDto
{
    public string?  Name              { get; set; }
    public string?  Description       { get; set; }
    public string?  Category          { get; set; }
    public decimal? Price             { get; set; }
    public int?     LowStockThreshold { get; set; }
}

// what the frontend sends when admin adds stock to a part
public class StockInDto
{
    public int    Quantity { get; set; }
    public string Reason   { get; set; } = "Purchase";
}

// what we send back to the frontend when showing part details
public class PartResponseDto
{
    public int      PartID            { get; set; }
    public int      VendorID          { get; set; }
    public string   VendorName        { get; set; } = string.Empty;
    public string   Name              { get; set; } = string.Empty;
    public string   Description       { get; set; } = string.Empty;
    public string   Category          { get; set; } = string.Empty;
    public string   PartNumber        { get; set; } = string.Empty;
    public decimal  Price             { get; set; }
    public int      Stock             { get; set; }
    public int      LowStockThreshold { get; set; }
    public bool     IsActive          { get; set; }
    public bool     IsLowStock        { get; set; }  // true when Stock <= LowStockThreshold
    public DateTime CreatedAt         { get; set; }
}
