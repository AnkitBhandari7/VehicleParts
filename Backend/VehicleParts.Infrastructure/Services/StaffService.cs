using VehicleParts.Application.DTOs;
using VehicleParts.Application.Interface.IRepository;
using VehicleParts.Application.Interface.IServices;
using VehicleParts.Domain.Models;

namespace VehicleParts.Infrastructure.Services;

// Feature 2: this service handles all the staff management logic
// it talks to both UserRepository and StaffRepository
public class StaffService : IStaffService
{
    private readonly IStaffRepository _staffRepo;
    private readonly IUserRepository  _userRepo;

    public StaffService(IStaffRepository staffRepo, IUserRepository userRepo)
    {
        _staffRepo = staffRepo;
        _userRepo  = userRepo;
    }

    // get all staff members and convert them to DTOs so we can send them to frontend
    public async Task<IEnumerable<StaffResponseDto>> GetAllStaffAsync()
    {
        var staffList = await _staffRepo.GetAllAsync();
        return staffList.Select(MapToDto);
    }

    // get one staff member by their staff ID
    public async Task<StaffResponseDto?> GetStaffByIdAsync(int staffId)
    {
        var staff = await _staffRepo.GetByIdAsync(staffId);
        if (staff == null) return null;
        return MapToDto(staff);
    }

    // create a new staff member - first create the user account, then the staff profile
    public async Task<StaffResponseDto> CreateStaffAsync(CreateStaffDto dto)
    {
        // step 1: create the User account (for login)
        var user = new User
        {
            Email        = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role         = "Staff",
            IsActive     = true,
            CreatedAt    = DateTime.UtcNow
        };
        await _userRepo.AddAsync(user);
        await _userRepo.SaveChangesAsync();

        // step 2: create the StaffDetail profile (personal info)
        var staff = new StaffDetail
        {
            UserID    = user.UserID,
            FirstName = dto.FirstName,
            LastName  = dto.LastName,
            Phone     = dto.Phone,
            Address   = dto.Address,
            Position  = dto.Position,
            HireDate  = dto.HireDate,
            Status    = "Active",
            CreatedAt = DateTime.UtcNow
        };
        await _staffRepo.AddAsync(staff);
        await _staffRepo.SaveChangesAsync();

        // load the user into staff so we can return the email
        staff.User = user;
        return MapToDto(staff);
    }

    // update an existing staff member's personal info
    public async Task<StaffResponseDto?> UpdateStaffAsync(int staffId, UpdateStaffDto dto)
    {
        var staff = await _staffRepo.GetByIdAsync(staffId);
        if (staff == null) return null;

        // only update the fields that were actually provided
        if (dto.FirstName != null) staff.FirstName = dto.FirstName;
        if (dto.LastName  != null) staff.LastName  = dto.LastName;
        if (dto.Phone     != null) staff.Phone     = dto.Phone;
        if (dto.Address   != null) staff.Address   = dto.Address;
        if (dto.Position  != null) staff.Position  = dto.Position;
        if (dto.Status    != null) staff.Status    = dto.Status;

        await _staffRepo.UpdateAsync(staff);
        await _staffRepo.SaveChangesAsync();
        return MapToDto(staff);
    }

    // delete a staff member from the database
    public async Task<bool> DeleteStaffAsync(int staffId)
    {
        var staff = await _staffRepo.GetByIdAsync(staffId);
        if (staff == null) return false;

        await _staffRepo.DeleteAsync(staff);
        await _staffRepo.SaveChangesAsync();
        return true;
    }

    // helper method to convert StaffDetail model into StaffResponseDto
    private static StaffResponseDto MapToDto(StaffDetail staff)
    {
        return new StaffResponseDto
        {
            StaffID   = staff.StaffID,
            UserID    = staff.UserID,
            Email     = staff.User?.Email ?? string.Empty,
            FirstName = staff.FirstName,
            LastName  = staff.LastName,
            Phone     = staff.Phone,
            Address   = staff.Address,
            Position  = staff.Position,
            Status    = staff.Status,
            HireDate  = staff.HireDate,
            CreatedAt = staff.CreatedAt
        };
    }
}
