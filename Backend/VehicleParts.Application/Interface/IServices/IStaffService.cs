using VehicleParts.Application.DTOs;

namespace VehicleParts.Application.Interface.IServices;

// this is the contract for Feature 2 - Staff management

public interface IStaffService
{
    
    Task<IEnumerable<StaffResponseDto>> GetAllStaffAsync();


    Task<StaffResponseDto?> GetStaffByIdAsync(int staffId);

    
    Task<StaffResponseDto> CreateStaffAsync(CreateStaffDto dto);

   
    Task<StaffResponseDto?> UpdateStaffAsync(int staffId, UpdateStaffDto dto);

    Task<bool> DeleteStaffAsync(int staffId);
}
