using VehicleParts.Domain.Models;

namespace VehicleParts.Application.Interface.IRepository;

public interface IServiceReviewRepository
{
    Task<ServiceReview> CreateServiceReviewAsync(ServiceReview review);
    Task<IEnumerable<ServiceReview>> GetReviewsByCustomerIdAsync(int customerId);
}