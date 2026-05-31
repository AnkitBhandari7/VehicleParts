namespace VehicleParts.Application.Interface.IServices;

public interface IEmailSender
{
    Task SendEmailAsync(string to, string subject, string body);
}
