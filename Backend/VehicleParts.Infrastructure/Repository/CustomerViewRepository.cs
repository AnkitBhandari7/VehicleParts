namespace VehicleParts.Infrastructure.Repository;

using Microsoft.EntityFrameworkCore;
using VehicleParts.Application.Interface.IRepository;
using VehicleParts.Domain.Models;
using VehicleParts.Infrastructure.Persistance;

public class CustomerViewRepository : ICustomerViewRepository
{
    private readonly AppDbContext _context;

    public CustomerViewRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<CustomerDetail?> GetCustomerByIdAsync(int customerId)
    {
        return await _context.CustomerDetails
            .FirstOrDefaultAsync(c => c.CustomerID == customerId);
    }

    public async Task<IEnumerable<Vehicle>> GetCustomerVehiclesAsync(int customerId)
    {
        return await _context.Vehicles
            .Where(v => v.CustomerID == customerId)
            .ToListAsync();
    }

    public async Task<IEnumerable<Invoice>> GetCustomerPurchaseHistoryAsync(int customerId)
    {
        return await _context.Invoices
            .Include(i => i.InvoiceItems)
                .ThenInclude(ii => ii.Part)
            .Where(i => i.CustomerID == customerId)
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync();
    }
}