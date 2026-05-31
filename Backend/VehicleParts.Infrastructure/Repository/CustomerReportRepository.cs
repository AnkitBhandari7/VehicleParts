namespace VehicleParts.Infrastructure.Repository;

using Microsoft.EntityFrameworkCore;
using VehicleParts.Application.Interface.IRepository;
using VehicleParts.Domain.Models;
using VehicleParts.Infrastructure.Persistance;

public class CustomerReportRepository : ICustomerReportRepository
{
    private readonly AppDbContext _context;

    public CustomerReportRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<CustomerDetail>> GetRegularCustomersAsync(int topCount)
    {
        return await _context.CustomerDetails
            .Include(c => c.User)
            .OrderByDescending(c => c.TotalVisits)
            .Take(topCount)
            .ToListAsync();
    }

    public async Task<IEnumerable<CustomerDetail>> GetHighSpendersAsync(int topCount)
    {
        return await _context.CustomerDetails
            .Include(c => c.User)
            .OrderByDescending(c => c.TotalSpent)
            .Take(topCount)
            .ToListAsync();
    }

    public async Task<IEnumerable<CustomerDetail>> GetPendingCreditCustomersAsync()
    {
        return await _context.CustomerDetails
            .Include(c => c.User)
            .Where(c => c.CreditBalance > 0)
            .OrderByDescending(c => c.CreditBalance)
            .ToListAsync();
    }
}