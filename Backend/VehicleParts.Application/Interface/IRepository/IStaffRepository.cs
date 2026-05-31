using VehicleParts.Domain.Models;

namespace VehicleParts.Application.Interface.IRepository;

// this is the contract for the Staff table in the database
// Feature 2: Admin manages staff members
public interface IStaffRepository
{
    Task<IEnumerable<StaffDetail>> GetAllAsync();
    Task<StaffDetail?> GetByIdAsync(int staffId);
    Task<StaffDetail?> GetByUserIdAsync(int userId);
    Task<StaffDetail> AddAsync(StaffDetail staff);
    Task UpdateAsync(StaffDetail staff);
    Task DeleteAsync(StaffDetail staff);
    Task SaveChangesAsync();
}
