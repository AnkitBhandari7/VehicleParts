using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Net.Mail;
using VehicleParts.Application.Interface.IServices;

namespace VehicleParts.Infrastructure.Services;

public class SmtpEmailSender : IEmailSender
{
    private readonly IConfiguration _config;
    private readonly ILogger<SmtpEmailSender> _logger;

    public SmtpEmailSender(IConfiguration config, ILogger<SmtpEmailSender> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task SendEmailAsync(string to, string subject, string body)
    {
        _logger.LogInformation("Attempting to send real email to {To} via Mailtrap", to);

        var server = _config["EmailSettings:SmtpServer"];
        var port = int.Parse(_config["EmailSettings:Port"] ?? "587");
        var username = _config["EmailSettings:Username"];
        var password = _config["EmailSettings:Password"];
        var fromEmail = _config["EmailSettings:FromEmail"];

        using var client = new SmtpClient(server, port)
        {
            Credentials = new NetworkCredential(username, password),
            EnableSsl = true
        };

        var mailMessage = new MailMessage
        {
            From = new MailAddress(fromEmail!),
            Subject = subject,
            Body = body,
            IsBodyHtml = true
        };
        mailMessage.To.Add(to);

        try
        {
            await client.SendMailAsync(mailMessage);
            _logger.LogInformation("SUCCESS: Email sent to {To} via Mailtrap", to);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "ERROR: Failed to send email to {To} via Mailtrap", to);
            throw;
        }
    }
}
