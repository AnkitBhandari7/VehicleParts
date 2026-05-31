using Microsoft.EntityFrameworkCore;
using VehicleParts.Application.Interface.IRepository;
using VehicleParts.Domain.Models;
using VehicleParts.Infrastructure.Persistance;

namespace VehicleParts.Infrastructure.Repository;

public class VendorRepository : IVendorRepository
{
    private readonly AppDbContext _context;

    public VendorRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Vendor>> GetAllAsync(bool activeOnly = false)
    {
        var query = _context.Vendors.AsQueryable();

        if (activeOnly)
            query = query.Where(v => v.IsActive);

        return await query.OrderBy(v => v.Name).ToListAsync();
    }

    public async Task<Vendor?> GetByIdAsync(int id)
        => await _context.Vendors.FindAsync(id);

    public async Task<Vendor> CreateAsync(Vendor vendor)
    {
        _context.Vendors.Add(vendor);
        await _context.SaveChangesAsync();
        return vendor;
    }

    public async Task<Vendor> UpdateAsync(Vendor vendor)
    {
        _context.Vendors.Update(vendor);
        await _context.SaveChangesAsync();
        return vendor;
    }

    public async Task<bool> DeactivateAsync(int id)
    {
        var vendor = await _context.Vendors.FindAsync(id);
        if (vendor is null) return false;

        vendor.IsActive = false;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ExistsAsync(int id)
        => await _context.Vendors.AnyAsync(v => v.VendorID == id);
}
