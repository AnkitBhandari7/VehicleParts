using Microsoft.EntityFrameworkCore;
using VehicleParts.Application.Interface.IRepository;
using VehicleParts.Domain.Models;
using VehicleParts.Infrastructure.Persistance;

namespace VehicleParts.Infrastructure.Repository;

public class ServiceReviewRepository : IServiceReviewRepository
{
    private readonly AppDbContext _context;

    public ServiceReviewRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ServiceReview> CreateServiceReviewAsync(ServiceReview review)
    {
        _context.ServiceReviews.Add(review);
        await _context.SaveChangesAsync();
        return review;
    }

    public async Task<IEnumerable<ServiceReview>> GetReviewsByCustomerIdAsync(int customerId)
    {
        return await _context.ServiceReviews
            .Where(r => r.CustomerID == customerId)
            .ToListAsync();
    }
}