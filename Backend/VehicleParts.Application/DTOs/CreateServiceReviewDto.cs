namespace VehicleParts.Application.DTOs;

public class CreateServiceReviewDto
{
    public int CustomerId { get; set; }
    public int AppointmentId { get; set; }
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
}