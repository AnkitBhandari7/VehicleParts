namespace VehicleParts.Application.DTOs;

public class CreateAppointmentDto
{
    public int CustomerId { get; set; }
    public int VehicleId { get; set; }
    public int StaffId { get; set; }
    public DateTime AppointmentDate { get; set; }
    public string TimeSlot { get; set; } = string.Empty;
    public string ServiceDescription { get; set; } = string.Empty;
}

public class UpdateAppointmentStatusDto
{
    public string Status { get; set; } = string.Empty;
}