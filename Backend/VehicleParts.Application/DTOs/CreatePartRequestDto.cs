namespace VehicleParts.Application.DTOs;

public class CreatePartRequestDto
{
    public int CustomerId { get; set; }
    public string PartName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public string Notes { get; set; } = string.Empty;
}