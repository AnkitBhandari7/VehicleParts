using VehicleParts.Application.DTOs;

namespace VehicleParts.Application.Interface.IServices;

public interface IVendorService
{
    Task<IEnumerable<VendorResponseDto>> GetAllVendorsAsync(bool activeOnly = false);
    Task<VendorResponseDto?> GetVendorByIdAsync(int id);
    Task<VendorResponseDto> CreateVendorAsync(CreateVendorDto dto);
    Task<VendorResponseDto?> UpdateVendorAsync(int id, UpdateVendorDto dto);
    Task<bool> DeactivateVendorAsync(int id);
}
