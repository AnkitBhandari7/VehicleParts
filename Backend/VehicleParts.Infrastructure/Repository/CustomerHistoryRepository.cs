using Microsoft.EntityFrameworkCore;
using VehicleParts.Application.Interface.IRepository;
using VehicleParts.Domain.Models;
using VehicleParts.Infrastructure.Persistance;

namespace VehicleParts.Infrastructure.Repository;

public class CustomerHistoryRepository : ICustomerHistoryRepository
{
    private readonly AppDbContext _context;

    public CustomerHistoryRepository(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Gets customer basic details by ID.
    /// </summary>
    public async Task<CustomerDetail?> GetCustomerByIdAsync(int customerId)
    {
        return await _context.CustomerDetails
            .FirstOrDefaultAsync(c => c.CustomerID == customerId);
    }

    /// <summary>
    /// Gets all purchase invoices for a customer with full item details.
    /// </summary>
    public async Task<IEnumerable<Invoice>> GetPurchaseHistoryAsync(int customerId)
    {
        return await _context.Invoices
            .Include(i => i.StaffDetail)
            .Include(i => i.InvoiceItems)
                .ThenInclude(ii => ii.Part)
            .Where(i => i.CustomerID == customerId)
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync();
    }

    /// <summary>
    /// Gets all service appointments for a customer with vehicle and review details.
    /// </summary>
    public async Task<IEnumerable<Appointment>> GetServiceHistoryAsync(int customerId)
    {
        return await _context.Appointments
            .Include(a => a.StaffDetail)
            .Include(a => a.Vehicle)
            .Include(a => a.ServiceReviews)
            .Where(a => a.CustomerID == customerId)
            .OrderByDescending(a => a.AppointmentDate)
            .ToListAsync();
    }
}