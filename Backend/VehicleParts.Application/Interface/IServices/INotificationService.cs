namespace VehicleParts.Application.Interface.IServices;

using VehicleParts.Application.DTOs;

public interface INotificationService
{
    Task<IEnumerable<LowStockPartDto>> GetLowStockPartsAsync();
    Task NotifyAdminLowStockAsync(int adminUserId);
    Task<IEnumerable<OverdueCreditDto>> GetOverdueCreditCustomersAsync();
    Task SendCreditRemindersAsync();
    Task<IEnumerable<NotificationDto>> GetNotificationsByUserIdAsync(int userId);
}