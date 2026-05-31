using Microsoft.EntityFrameworkCore;
using VehicleParts.Application.Interface.IRepository;
using VehicleParts.Domain.Models;
using VehicleParts.Infrastructure.Persistance;

namespace VehicleParts.Infrastructure.Repository;

// Feature 3: this is the actual code that talks to the Parts table in the database

public class PartRepository : IPartRepository
{
    private readonly AppDbContext _context;

    public PartRepository(AppDbContext context)
    {
        _context = context;
    }

    // get all active parts and include their linked Vendor info
    public async Task<IEnumerable<Part>> GetAllAsync()
    {
        return await _context.Parts
            .Where(p => p.IsActive)
            .Include(p => p.Vendor)
            .ToListAsync();
    }

    // find one part by its ID number
    public async Task<Part?> GetByIdAsync(int partId)
    {
        return await _context.Parts
            .Include(p => p.Vendor)
            .FirstOrDefaultAsync(p => p.PartID == partId);
    }

    // check if a part with this part number already exists in the database
    public async Task<Part?> GetByPartNumberAsync(string partNumber)
    {
        return await _context.Parts
            .FirstOrDefaultAsync(p => p.PartNumber == partNumber);
    }

    // search for parts by name or category (used by the search bar)
    public async Task<IEnumerable<Part>> SearchAsync(string keyword)
    {
        return await _context.Parts
            .Where(p => p.IsActive &&
                        (p.Name.Contains(keyword) || p.Category.Contains(keyword)))
            .Include(p => p.Vendor)
            .ToListAsync();
    }

    // add a new part row into the Parts table
    public async Task<Part> AddAsync(Part part)
    {
        _context.Parts.Add(part);
        return part;
    }

    // update an existing part record
    public async Task UpdateAsync(Part part)
    {
        _context.Parts.Update(part);
    }

    // delete a part from the database
    public async Task DeleteAsync(Part part)
    {
        _context.Parts.Remove(part);
    }

    // add a stock transaction record when admin buys new stock
    public async Task AddStockTransactionAsync(StockTransaction transaction)
    {
        _context.StockTransactions.Add(transaction);
    }

    // save all pending changes to the database
    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
