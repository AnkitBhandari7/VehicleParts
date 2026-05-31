using System.ComponentModel.DataAnnotations;

namespace VehicleParts.Application.DTOs;

public class SendInvoiceEmailDto
{
    [Required]
    public int InvoiceID { get; set; }

    [Required]
    public string Subject { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;
}

public class EmailResultDto
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
}
