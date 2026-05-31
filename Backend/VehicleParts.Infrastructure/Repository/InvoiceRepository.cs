using Microsoft.EntityFrameworkCore;
using VehicleParts.Application.Interface.IRepository;
using VehicleParts.Domain.Models;
using VehicleParts.Infrastructure.Persistance;

namespace VehicleParts.Infrastructure.Repository;

public class InvoiceRepository : IInvoiceRepository
{
    private readonly AppDbContext _context;

    public InvoiceRepository(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Creates a new invoice and saves it to the database.
    /// </summary>
    public async Task<Invoice> CreateInvoiceAsync(Invoice invoice)
    {
        _context.Invoices.Add(invoice);
        await _context.SaveChangesAsync();
        return invoice;
    }

    /// <summary>
    /// Gets a single invoice by ID with all related data.
    /// </summary>
    public async Task<Invoice?> GetInvoiceByIdAsync(int invoiceId)
    {
        return await _context.Invoices
            .Include(i => i.CustomerDetail)
            .Include(i => i.StaffDetail)
            .Include(i => i.InvoiceItems)
                .ThenInclude(ii => ii.Part)
            .FirstOrDefaultAsync(i => i.InvoiceID == invoiceId);
    }

    /// <summary>
    /// Gets all invoices for a specific customer.
    /// </summary>
    public async Task<IEnumerable<Invoice>> GetInvoicesByCustomerIdAsync(int customerId)
    {
        return await _context.Invoices
            .Include(i => i.CustomerDetail)
            .Include(i => i.StaffDetail)
            .Include(i => i.InvoiceItems)
                .ThenInclude(ii => ii.Part)
            .Where(i => i.CustomerID == customerId)
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync();
    }
}