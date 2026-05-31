using VehicleParts.Application.DTOs;
using VehicleParts.Domain.Models;

namespace VehicleParts.Application.Interface.IServices;

public interface IPartRequestService
{
    Task<PartRequest> CreatePartRequestAsync(CreatePartRequestDto dto);
    Task<IEnumerable<PartRequest>> GetPartRequestsByCustomerIdAsync(int customerId);
}