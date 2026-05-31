using VehicleParts.Application.DTOs;
using VehicleParts.Application.Interface.IRepository;
using VehicleParts.Application.Interface.IServices;
using VehicleParts.Domain.Models;

namespace VehicleParts.Infrastructure.Services;

public class ServiceReviewService : IServiceReviewService
{
    private readonly IServiceReviewRepository _serviceReviewRepository;

    public ServiceReviewService(IServiceReviewRepository serviceReviewRepository)
    {
        _serviceReviewRepository = serviceReviewRepository;
    }

    public async Task<ServiceReview> SubmitReviewAsync(CreateServiceReviewDto dto)
    {
        var review = new ServiceReview
        {
            CustomerID = dto.CustomerId,
            AppointmentID = dto.AppointmentId,
            Rating = dto.Rating,
            Comment = dto.Comment,
            ReviewedAt = DateTime.UtcNow
        };

        return await _serviceReviewRepository.CreateServiceReviewAsync(review);
    }

    public async Task<IEnumerable<ServiceReview>> GetReviewsByCustomerIdAsync(int customerId)
    {
        return await _serviceReviewRepository.GetReviewsByCustomerIdAsync(customerId);
    }
}