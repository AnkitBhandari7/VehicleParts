namespace VehicleParts.Application.DTOs;

public class CustomerVehicleDto
{
    public int VehicleID { get; set; }
    public string VehicleNumber { get; set; } = string.Empty;
    public string Make { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public string Year { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public string VIN { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
}