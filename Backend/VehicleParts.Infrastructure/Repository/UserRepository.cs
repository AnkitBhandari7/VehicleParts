using Microsoft.EntityFrameworkCore;
using VehicleParts.Application.Interface.IRepository;
using VehicleParts.Domain.Models;
using VehicleParts.Infrastructure.Persistance;

namespace VehicleParts.Infrastructure.Repository;

// this is the actual code that talks to the Users table in the database
// it uses AppDbContext (Entity Framework) to run the SQL queries for us
public class UserRepository : IUserRepository
{
    private readonly AppDbContext _context;

    // we get the database connection from the constructor
    public UserRepository(AppDbContext context)
    {
        _context = context;
    }

    // search the database for a user with this email
    // includes CustomerDetail and StaffDetail so the auth service can populate the login response correctly
    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _context.Users
            .Include(u => u.CustomerDetail)
            .Include(u => u.StaffDetail)
            .FirstOrDefaultAsync(u => u.Email == email);
    }

    // search the database for a user with this ID
    public async Task<User?> GetByIdAsync(int id)
    {
        return await _context.Users.FindAsync(id);
    }

    // add a new user row into the Users table
    public async Task<User> AddAsync(User user)
    {
        _context.Users.Add(user);
        return user;
    }

    // save all pending changes to the database
    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
