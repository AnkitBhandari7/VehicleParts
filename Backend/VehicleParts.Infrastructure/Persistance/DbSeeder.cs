using Microsoft.EntityFrameworkCore;
using VehicleParts.Domain.Models;
using VehicleParts.Infrastructure.Persistance;

namespace VehicleParts.Infrastructure.Persistance;

// this class runs once when the app starts to make sure an Admin user exists in the database
// if there is already an admin, it does nothing and skips
public class DbSeeder
{
    // this method is called from Program.cs when the app boots up
    public static async Task SeedAsync(AppDbContext context)
    {
        // make sure the database tables exist before we try to add data
        await context.Database.MigrateAsync();

        // check if there is already a user with the Admin role in the database
        bool adminExists = await context.Users
            .AnyAsync(u => u.Role == "Admin");

        // if an admin already exists we do not need to create another one
        if (adminExists)
            return;

        // create the default admin user for the first time
        // IMPORTANT: change this password after the first login!
        var adminUser = new User
        {
            Email        = "admin@autopartpro.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
            Role         = "Admin",
            IsActive     = true,
            CreatedAt    = DateTime.UtcNow
        };

        context.Users.Add(adminUser);
        await context.SaveChangesAsync();

        // also create the admin staff profile linked to that user
        var adminStaff = new StaffDetail
        {
            UserID    = adminUser.UserID,
            FirstName = "System",
            LastName  = "Admin",
            Phone     = "0000000000",
            Address   = "AutoPart Pro HQ",
            Position  = "Administrator",
            HireDate  = DateTime.UtcNow,
            Status    = "Active",
            CreatedAt = DateTime.UtcNow
        };

        context.StaffDetails.Add(adminStaff);
        await context.SaveChangesAsync();

        // add a default vendor so we can immediately start adding parts
        var defaultVendor = new Vendor
        {
            Name          = "Default Supplier",
            ContactPerson = "Admin",
            Phone         = "0000000000",
            Email         = "supplier@autopartpro.com",
            Address       = "Supplier HQ",
            IsActive      = true,
            CreatedAt     = DateTime.UtcNow
        };
        context.Vendors.Add(defaultVendor);
        await context.SaveChangesAsync();

        Console.WriteLine("Default admin account created: admin@autopartpro.com / Admin@123");
        Console.WriteLine($"Default vendor created with VendorID: {defaultVendor.VendorID}");
    }
}
