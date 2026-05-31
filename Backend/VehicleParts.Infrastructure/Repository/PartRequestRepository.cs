using Microsoft.EntityFrameworkCore;
using VehicleParts.Application.Interface.IRepository;
using VehicleParts.Domain.Models;
using VehicleParts.Infrastructure.Persistance;

namespace VehicleParts.Infrastructure.Repository;

public class PartRequestRepository : IPartRequestRepository
{
    private readonly AppDbContext _context;

    public PartRequestRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PartRequest> CreatePartRequestAsync(PartRequest partRequest)
    {
        _context.PartRequests.Add(partRequest);
        await _context.SaveChangesAsync();
        return partRequest;
    }

    public async Task<IEnumerable<PartRequest>> GetPartRequestsByCustomerIdAsync(int customerId)
    {
        return await _context.PartRequests
            .Where(p => p.CustomerID == customerId)
            .ToListAsync();
    }
}