namespace VehicleParts.API.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VehicleParts.Application.Interface.IServices;

[ApiController]
[Route("api/notifications")]
[Authorize]
public class NotificationController : ControllerBase
{
    private readonly INotificationService _service;

    public NotificationController(INotificationService service)
    {
        _service = service;
    }

    [HttpGet("low-stock")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> GetLowStockParts()
    {
        var parts = await _service.GetLowStockPartsAsync();
        return Ok(parts);
    }

    [HttpPost("low-stock/notify/{adminUserId}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> NotifyAdminLowStock(int adminUserId)
    {
        await _service.NotifyAdminLowStockAsync(adminUserId);
        return Ok("Low stock notifications sent to admin.");
    }

    [HttpGet("overdue-credits")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> GetOverdueCreditCustomers()
    {
        var customers = await _service.GetOverdueCreditCustomersAsync();
        return Ok(customers);
    }

    [HttpPost("overdue-credits/notify")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> SendCreditReminders()
    {
        await _service.SendCreditRemindersAsync();
        return Ok("Credit reminders sent to overdue customers.");
    }

    [HttpGet("{userId}")]
    [Authorize(Roles = "Admin,Staff,Customer")]
    public async Task<IActionResult> GetNotificationsByUserId(int userId)
    {
        var notifications = await _service.GetNotificationsByUserIdAsync(userId);
        return Ok(notifications);
    }
}