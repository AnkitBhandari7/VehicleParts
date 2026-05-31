using Microsoft.EntityFrameworkCore;
using VehicleParts.Application.Interface.IRepository;
using VehicleParts.Domain.Models;
using VehicleParts.Infrastructure.Persistance;

namespace VehicleParts.Infrastructure.Repository;

public class PurchaseInvoiceRepository : IPurchaseInvoiceRepository
{
    private readonly AppDbContext _context;

    public PurchaseInvoiceRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<PurchaseInvoice>> GetAllAsync()
        => await _context.PurchaseInvoices
            .Include(p => p.Vendor)
            .Include(p => p.Part)
            .OrderByDescending(p => p.PurchasedAt)
            .ToListAsync();

    public async Task<IEnumerable<PurchaseInvoice>> GetByVendorAsync(int vendorId)
        => await _context.PurchaseInvoices
            .Include(p => p.Vendor)
            .Include(p => p.Part)
            .Where(p => p.VendorID == vendorId)
            .OrderByDescending(p => p.PurchasedAt)
            .ToListAsync();

    public async Task<PurchaseInvoice?> GetByIdAsync(int id)
        => await _context.PurchaseInvoices
            .Include(p => p.Vendor)
            .Include(p => p.Part)
            .FirstOrDefaultAsync(p => p.PurchaseInvoiceID == id);

    public async Task<PurchaseInvoice> CreateAsync(PurchaseInvoice purchaseInvoice)
    {
        _context.PurchaseInvoices.Add(purchaseInvoice);
        await _context.SaveChangesAsync();
        return purchaseInvoice;
    }
}
