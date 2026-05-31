namespace VehicleParts.Application.DTOs;

public class NotificationDto
{
    public int NotificationID { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public bool EmailSent { get; set; }
    public DateTime CreatedAt { get; set; }
}