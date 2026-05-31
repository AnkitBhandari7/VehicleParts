using VehicleParts.Application.DTOs;
using VehicleParts.Application.Interface.IRepository;
using VehicleParts.Application.Interface.IServices;
using VehicleParts.Domain.Models;

namespace VehicleParts.Infrastructure.Services;

public class PartRequestService : IPartRequestService
{
    private readonly IPartRequestRepository _partRequestRepository;

    public PartRequestService(IPartRequestRepository partRequestRepository)
    {
        _partRequestRepository = partRequestRepository;
    }

    public async Task<PartRequest> CreatePartRequestAsync(CreatePartRequestDto dto)
    {
        var partRequest = new PartRequest
        {
            CustomerID = dto.CustomerId,
            PartName = dto.PartName,
            Quantity = dto.Quantity,
            Notes = dto.Notes,
            Status = "Pending",
            RequestedAt = DateTime.UtcNow
        };

        return await _partRequestRepository.CreatePartRequestAsync(partRequest);
    }

    public async Task<IEnumerable<PartRequest>> GetPartRequestsByCustomerIdAsync(int customerId)
    {
        return await _partRequestRepository.GetPartRequestsByCustomerIdAsync(customerId);
    }
}