using VehicleParts.Application.DTOs;
using VehicleParts.Domain.Models;

namespace VehicleParts.Application.Interface.IServices;

public interface IServiceReviewService
{
    Task<ServiceReview> SubmitReviewAsync(CreateServiceReviewDto dto);
    Task<IEnumerable<ServiceReview>> GetReviewsByCustomerIdAsync(int customerId);
}