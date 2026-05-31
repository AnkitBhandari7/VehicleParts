using Microsoft.EntityFrameworkCore;
using VehicleParts.Application.Interface.IRepository;
using VehicleParts.Domain.Models;
using VehicleParts.Infrastructure.Persistance;
using VehicleParts.Application.DTOs;


namespace VehicleParts.Infrastructure.Repository;

public class CustomerRepository : ICustomerRepository
{
    private readonly AppDbContext _context;

    public CustomerRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<CustomerDetail>> GetAllAsync()
        => await _context.CustomerDetails
            .Include(c => c.User)
            .Include(c => c.Vehicles)
            .OrderBy(c => c.FirstName)
            .ThenBy(c => c.LastName)
            .ToListAsync();

    public async Task<CustomerDetail?> GetByIdAsync(int id)
        => await _context.CustomerDetails
            .Include(c => c.User)
            .Include(c => c.Vehicles)
            .FirstOrDefaultAsync(c => c.CustomerID == id);

    public async Task<bool> EmailExistsAsync(string email)
        => await _context.Users.AnyAsync(u => u.Email.ToLower() == email.ToLower());

    public async Task<CustomerDetail> CreateAsync(User user, CustomerDetail customer)
    {
        // Save user first to generate UserID
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // Link customer to the newly created user
        customer.UserID = user.UserID;
        _context.CustomerDetails.Add(customer);
        await _context.SaveChangesAsync();

        return customer;
    }

    public async Task<Vehicle> AddVehicleAsync(Vehicle vehicle)
    {
        _context.Vehicles.Add(vehicle);
        await _context.SaveChangesAsync();
        return vehicle;
    }

    public async Task<IEnumerable<Vehicle>> GetVehiclesByCustomerAsync(int customerId)
        => await _context.Vehicles
            .Where(v => v.CustomerID == customerId)
            .OrderBy(v => v.Make)
            .ThenBy(v => v.Model)
            .ToListAsync();

    public async Task<bool> CustomerExistsAsync(int customerId)
        => await _context.CustomerDetails.AnyAsync(c => c.CustomerID == customerId);

    public async Task<List<CustomerDetail>> SearchAsync(CustomerSearchType type, string? query, CancellationToken ct)
    {
        query = query?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(query))
        {
            return new List<CustomerDetail>();
        }

        IQueryable<CustomerDetail> q = _context.CustomerDetails
            .Include(c => c.User)
            .Include(c => c.Vehicles);

        switch (type)
        {
            case CustomerSearchType.Name:
                var lower = query.ToLower();
                q = q.Where(c => (c.FirstName + " " + c.LastName).ToLower().Contains(lower));
                break;

            case CustomerSearchType.PhoneNumber:
                var phone = query.Replace(" ", "").Replace("-", "");
                q = q.Where(c => c.Phone.Contains(phone));
                break;

            case CustomerSearchType.CustomerId:
                if (int.TryParse(query, out var id))
                {
                    q = q.Where(c => c.CustomerID == id);
                }
                else
                {
                    return new List<CustomerDetail>();
                }
                break;

            case CustomerSearchType.VehiclePlateNumber:
                var plate = query.Trim().ToUpper();
                q = q.Where(c => c.Vehicles.Any(v => v.VehicleNumber.ToUpper().Contains(plate)));
                break;

            default:
                return new List<CustomerDetail>();
        }

        return await q
            .OrderBy(c => c.FirstName)
            .ThenBy(c => c.LastName)
            .Take(50)
            .ToListAsync(ct);
    }

    public async Task UpdateAsync(CustomerDetail customer)
    {
        _context.CustomerDetails.Update(customer);
        await _context.SaveChangesAsync();
    }
}

