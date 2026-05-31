using Microsoft.EntityFrameworkCore;
using VehicleParts.Application.Interface.IRepository;
using VehicleParts.Domain.Models;
using VehicleParts.Infrastructure.Persistance;

namespace VehicleParts.Infrastructure.Repository;

public class LoyaltyRepository : ILoyaltyRepository
{
    private readonly AppDbContext _context;

    public LoyaltyRepository(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Gets customer details by ID.
    /// </summary>
    public async Task<CustomerDetail?> GetCustomerByIdAsync(int customerId)
    {
        return await _context.CustomerDetails
            .FirstOrDefaultAsync(c => c.CustomerID == customerId);
    }

    /// <summary>
    /// Gets all loyalty transactions for a customer.
    /// </summary>
    public async Task<IEnumerable<LoyaltyTransaction>> GetTransactionsByCustomerIdAsync(int customerId)
    {
        return await _context.LoyaltyTransactions
            .Include(l => l.CustomerDetail)
            .Where(l => l.CustomerID == customerId)
            .OrderByDescending(l => l.CreatedAt)
            .ToListAsync();
    }
}