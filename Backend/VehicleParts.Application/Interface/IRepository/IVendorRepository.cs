using VehicleParts.Domain.Models;

namespace VehicleParts.Application.Interface.IRepository;

public interface IVendorRepository
{
    Task<IEnumerable<Vendor>> GetAllAsync(bool activeOnly = false);
    Task<Vendor?> GetByIdAsync(int id);
    Task<Vendor> CreateAsync(Vendor vendor);
    Task<Vendor> UpdateAsync(Vendor vendor);
    Task<bool> DeactivateAsync(int id);
    Task<bool> ExistsAsync(int id);
}
