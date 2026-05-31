using VehicleParts.Domain.Models;

namespace VehicleParts.Application.Interface.IRepository;

// this is the contract for talking to the Users table in the database
// the actual code that talks to the database will be written in Infrastructure/Repository
public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByIdAsync(int id);
    Task<User> AddAsync(User user);
    Task SaveChangesAsync();
}
