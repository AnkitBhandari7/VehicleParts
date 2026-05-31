using Microsoft.EntityFrameworkCore;
using VehicleParts.Application.Interface.IRepository;
using VehicleParts.Domain.Models;
using VehicleParts.Infrastructure.Persistance;

namespace VehicleParts.Infrastructure.Repository;

// Feature 2: this is the actual code that talks to the StaffDetails table in the database
// it uses AppDbContext (Entity Framework) to run the SQL queries for us
public class StaffRepository : IStaffRepository
{
    private readonly AppDbContext _context;

    public StaffRepository(AppDbContext context)
    {
        _context = context;
    }

    // get all staff members and also load their linked User account
    public async Task<IEnumerable<StaffDetail>> GetAllAsync()
    {
        return await _context.StaffDetails
            .Include(s => s.User)
            .ToListAsync();
    }

    // find one staff member by their staff ID number
    public async Task<StaffDetail?> GetByIdAsync(int staffId)
    {
        return await _context.StaffDetails
            .Include(s => s.User)
            .FirstOrDefaultAsync(s => s.StaffID == staffId);
    }

    // find a staff member using their linked User account ID
    public async Task<StaffDetail?> GetByUserIdAsync(int userId)
    {
        return await _context.StaffDetails
            .Include(s => s.User)
            .FirstOrDefaultAsync(s => s.UserID == userId);
    }

    // add a new staff member row into the StaffDetails table
    public async Task<StaffDetail> AddAsync(StaffDetail staff)
    {
        _context.StaffDetails.Add(staff);
        return staff;
    }

    // update an existing staff member record
    public async Task UpdateAsync(StaffDetail staff)
    {
        _context.StaffDetails.Update(staff);
    }

    // delete a staff member from the database
    public async Task DeleteAsync(StaffDetail staff)
    {
        _context.StaffDetails.Remove(staff);
    }

    // save all pending changes to the database
    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
