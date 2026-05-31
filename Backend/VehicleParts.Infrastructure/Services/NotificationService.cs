namespace VehicleParts.Infrastructure.Services;

using VehicleParts.Application.DTOs;
using VehicleParts.Application.Interface.IRepository;
using VehicleParts.Application.Interface.IServices;
using VehicleParts.Domain.Models;

public class NotificationService : INotificationService
{
    private readonly INotificationRepository _repository;

    public NotificationService(INotificationRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<LowStockPartDto>> GetLowStockPartsAsync()
    {
        var parts = await _repository.GetLowStockPartsAsync();

        return parts.Select(p => new LowStockPartDto
        {
            PartID = p.PartID,
            Name = p.Name,
            PartNumber = p.PartNumber,
            Category = p.Category,
            Stock = p.Stock,
            LowStockThreshold = p.LowStockThreshold,
            VendorName = p.Vendor.Name
        });
    }

    public async Task NotifyAdminLowStockAsync(int adminUserId)
    {
        var lowStockParts = await _repository.GetLowStockPartsAsync();

        foreach (var part in lowStockParts)
        {
            var notification = new Notification
            {
                UserID = adminUserId,
                Type = "LowStock",
                Message = $"Low stock alert: {part.Name} (Part No: {part.PartNumber}) has only {part.Stock} units left. Threshold is {part.LowStockThreshold}.",
                IsRead = false,
                EmailSent = false,
                CreatedAt = DateTime.UtcNow
            };

            await _repository.CreateNotificationAsync(notification);
        }
    }

    public async Task<IEnumerable<OverdueCreditDto>> GetOverdueCreditCustomersAsync()
    {
        var customers = await _repository.GetOverdueCreditCustomersAsync();

        return customers.Select(c => new OverdueCreditDto
        {
            CustomerID = c.CustomerID,
            FirstName = c.FirstName,
            LastName = c.LastName,
            Phone = c.Phone,
            CreditBalance = c.CreditBalance,
            CreditStatus = c.CreditStatus,
            LastCreditReminderSent = c.LastCreditReminderSent
        });
    }

    public async Task SendCreditRemindersAsync()
    {
        var overdueCustomers = await _repository.GetOverdueCreditCustomersAsync();

        foreach (var customer in overdueCustomers)
        {
            var notification = new Notification
            {
                UserID = customer.UserID,
                Type = "CreditReminder",
                Message = $"Dear {customer.FirstName}, your outstanding credit balance of {customer.CreditBalance:C} is overdue. Please make a payment as soon as possible.",
                IsRead = false,
                EmailSent = false,
                CreatedAt = DateTime.UtcNow
            };

            await _repository.CreateNotificationAsync(notification);
            await _repository.UpdateCustomerReminderSentAsync(customer.CustomerID);
        }
    }

    public async Task<IEnumerable<NotificationDto>> GetNotificationsByUserIdAsync(int userId)
    {
        var notifications = await _repository.GetNotificationsByUserIdAsync(userId);

        return notifications.Select(n => new NotificationDto
        {
            NotificationID = n.NotificationID,
            Type = n.Type,
            Message = n.Message,
            IsRead = n.IsRead,
            EmailSent = n.EmailSent,
            CreatedAt = n.CreatedAt
        });
    }
}