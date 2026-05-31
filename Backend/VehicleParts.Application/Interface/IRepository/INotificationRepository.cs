namespace VehicleParts.Application.Interface.IRepository;

using VehicleParts.Domain.Models;

public interface INotificationRepository
{
    Task<IEnumerable<Part>> GetLowStockPartsAsync();
    Task<IEnumerable<CustomerDetail>> GetOverdueCreditCustomersAsync();
    Task CreateNotificationAsync(Notification notification);
    Task<IEnumerable<Notification>> GetNotificationsByUserIdAsync(int userId);
    Task UpdateCustomerReminderSentAsync(int customerId);
}