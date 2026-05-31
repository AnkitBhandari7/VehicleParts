using VehicleParts.Application.DTOs;
using VehicleParts.Application.Interface.IRepository;
using VehicleParts.Application.Interface.IServices;
using VehicleParts.Domain.Models;

namespace VehicleParts.Infrastructure.Services;

public class VendorService : IVendorService
{
    private readonly IVendorRepository _vendorRepository;

    public VendorService(IVendorRepository vendorRepository)
    {
        _vendorRepository = vendorRepository;
    }

    public async Task<IEnumerable<VendorResponseDto>> GetAllVendorsAsync(bool activeOnly = false)
    {
        var vendors = await _vendorRepository.GetAllAsync(activeOnly);
        return vendors.Select(MapToDto);
    }

    public async Task<VendorResponseDto?> GetVendorByIdAsync(int id)
    {
        var vendor = await _vendorRepository.GetByIdAsync(id);
        return vendor is null ? null : MapToDto(vendor);
    }

    public async Task<VendorResponseDto> CreateVendorAsync(CreateVendorDto dto)
    {
        var vendor = new Vendor
        {
            Name        = dto.Name,
            ContactPerson = dto.ContactPerson,
            Phone       = dto.Phone,
            Email       = dto.Email,
            Address     = dto.Address
        };

        var created = await _vendorRepository.CreateAsync(vendor);
        return MapToDto(created);
    }

    public async Task<VendorResponseDto?> UpdateVendorAsync(int id, UpdateVendorDto dto)
    {
        var vendor = await _vendorRepository.GetByIdAsync(id);
        if (vendor is null) return null;

        vendor.Name          = dto.Name;
        vendor.ContactPerson = dto.ContactPerson;
        vendor.Phone         = dto.Phone;
        vendor.Email         = dto.Email;
        vendor.Address       = dto.Address;
        vendor.IsActive      = dto.IsActive;

        var updated = await _vendorRepository.UpdateAsync(vendor);
        return MapToDto(updated);
    }

    public async Task<bool> DeactivateVendorAsync(int id)
        => await _vendorRepository.DeactivateAsync(id);

    private static VendorResponseDto MapToDto(Vendor v) => new()
    {
        VendorID      = v.VendorID,
        Name          = v.Name,
        ContactPerson = v.ContactPerson,
        Phone         = v.Phone,
        Email         = v.Email,
        Address       = v.Address,
        IsActive      = v.IsActive,
        CreatedAt     = v.CreatedAt
    };
}
