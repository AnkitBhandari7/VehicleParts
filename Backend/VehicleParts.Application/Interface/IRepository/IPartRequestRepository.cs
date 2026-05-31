using VehicleParts.Domain.Models;

namespace VehicleParts.Application.Interface.IRepository;

public interface IPartRequestRepository
{
    Task<PartRequest> CreatePartRequestAsync(PartRequest partRequest);
    Task<IEnumerable<PartRequest>> GetPartRequestsByCustomerIdAsync(int customerId);
}