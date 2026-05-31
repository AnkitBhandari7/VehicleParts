namespace VehicleParts.Infrastructure.Repository;

using Microsoft.EntityFrameworkCore;
using VehicleParts.Application.Interface.IRepository;
using VehicleParts.Domain.Models;
using VehicleParts.Infrastructure.Persistance;

public class NotificationRepository : INotificationRepository
{
    private readonly AppDbContext _context;

    public NotificationRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Part>> GetLowStockPartsAsync()
    {
        return await _context.Parts
            .Include(p => p.Vendor)
            .Where(p => p.Stock < p.LowStockThreshold && p.IsActive)
            .ToListAsync();
    }

    public async Task<IEnumerable<CustomerDetail>> GetOverdueCreditCustomersAsync()
    {
        var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);

        return await _context.CustomerDetails
            .Where(c => c.CreditBalance > 0 &&
                (c.LastCreditReminderSent == null ||
                 c.LastCreditReminderSent < thirtyDaysAgo))
            .ToListAsync();
    }

    public async Task CreateNotificationAsync(Notification notification)
    {
        await _context.Notifications.AddAsync(notification);
        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<Notification>> GetNotificationsByUserIdAsync(int userId)
    {
        return await _context.Notifications
            .Where(n => n.UserID == userId)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();
    }

    public async Task UpdateCustomerReminderSentAsync(int customerId)
    {
        var customer = await _context.CustomerDetails
            .FirstOrDefaultAsync(c => c.CustomerID == customerId);

        if (customer != null)
        {
            customer.LastCreditReminderSent = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }
}