using Microsoft.EntityFrameworkCore;
using VehicleParts.Domain.Models;
using VehicleParts.Infrastructure.Persistance;

namespace VehicleParts.Infrastructure.Services;

// DataSeeder - adds demo invoice and parts data to the database
// this makes the financial dashboard show real numbers instead of zeros
// it runs after DbSeeder so the admin user and default vendor already exist
public static class DataSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        // if there are already invoices in the database, skip seeding
        if (await db.Invoices.AnyAsync()) return;

        // get the existing admin user created by DbSeeder
        var adminUser = await db.Users.FirstOrDefaultAsync(u => u.Role == "Admin");
        if (adminUser == null) return; // admin must exist first

        // get the existing staff record linked to the admin user
        var adminStaff = await db.StaffDetails.FirstOrDefaultAsync(s => s.UserID == adminUser.UserID);
        if (adminStaff == null) return;

        // get the default vendor created by DbSeeder
        var existingVendor = await db.Vendors.FirstOrDefaultAsync();
        if (existingVendor == null) return;

        Console.WriteLine("Seeding demo financial data...");

        // --- create a demo customer ---
        // first check if a customer user exists already
        var customerUser = await db.Users.FirstOrDefaultAsync(u => u.Role == "Customer");
        if (customerUser == null)
        {
            customerUser = new User
            {
                Email = "customer@example.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Customer@123"),
                Role = "Customer",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
            };
            db.Users.Add(customerUser);
            await db.SaveChangesAsync();
        }

        // get or create customer detail
        var customer = await db.CustomerDetails.FirstOrDefaultAsync(c => c.UserID == customerUser.UserID);
        if (customer == null)
        {
            customer = new CustomerDetail
            {
                UserID = customerUser.UserID,
                FirstName = "James",
                LastName = "Brown",
                Phone = "07711223344",
                Address = "78 Customer Street",
                DateOfBirth = new DateTime(1985, 5, 15, 0, 0, 0, DateTimeKind.Utc),
            };
            db.CustomerDetails.Add(customer);
            await db.SaveChangesAsync();
        }

        // --- seed demo parts ---
        var parts = new List<Part>
        {
            new Part { VendorID = existingVendor.VendorID, Name = "Ceramic Brake Pads", Category = "Replacement Parts", PartNumber = "BP-001", Price = 45.99m, Stock = 4, LowStockThreshold = 10 },
            new Part { VendorID = existingVendor.VendorID, Name = "V8 Cylinder Head Gasket", Category = "Replacement Parts", PartNumber = "CHG-002", Price = 120.00m, Stock = 2, LowStockThreshold = 5 },
            new Part { VendorID = existingVendor.VendorID, Name = "High-Flow Fuel Injector", Category = "Workshop Service", PartNumber = "FI-003", Price = 89.50m, Stock = 3, LowStockThreshold = 5 },
            new Part { VendorID = existingVendor.VendorID, Name = "Synthetic Oil 5W-30", Category = "Accessory Sales", PartNumber = "OIL-004", Price = 12.99m, Stock = 9, LowStockThreshold = 20 },
            new Part { VendorID = existingVendor.VendorID, Name = "Air Filter Premium", Category = "Replacement Parts", PartNumber = "AF-005", Price = 28.00m, Stock = 35, LowStockThreshold = 10 },
        };
        db.Parts.AddRange(parts);
        await db.SaveChangesAsync();

        // --- seed invoices for the last 6 months ---
        // this gives the financial chart something real to display
        var random = new Random(42);
        var invoices = new List<Invoice>();

        for (int monthsAgo = 5; monthsAgo >= 0; monthsAgo--)
        {
            // create 5-8 invoices per month
            int count = random.Next(5, 9);
            for (int i = 0; i < count; i++)
            {
                var invoiceDate = DateTime.UtcNow.AddMonths(-monthsAgo).AddDays(-random.Next(0, 28));
                var amount = random.Next(1000, 25000);

                invoices.Add(new Invoice
                {
                    CustomerID = customer.CustomerID,
                    StaffID = adminStaff.StaffID,
                    Type = "Sale",
                    SubTotal = amount,
                    DiscountPercent = 0,
                    DiscountAmount = 0,
                    TotalAmount = amount,
                    IsPaid = random.Next(0, 10) > 2, // 80% are paid
                    IsCreditSale = false,
                    Notes = $"Demo invoice month-{monthsAgo} item-{i}",
                    CreatedAt = invoiceDate,
                });
            }
        }

        db.Invoices.AddRange(invoices);
        await db.SaveChangesAsync();

        // --- seed invoice items linked to the first 15 invoices ---
        var savedInvoices = await db.Invoices.Take(15).ToListAsync();
        var invoiceItems = new List<InvoiceItem>();

        foreach (var invoice in savedInvoices)
        {
            // each invoice has 1-3 parts
            int partCount = random.Next(1, 4);
            for (int p = 0; p < partCount; p++)
            {
                var part = parts[random.Next(parts.Count)];
                var qty = random.Next(1, 5);
                invoiceItems.Add(new InvoiceItem
                {
                    InvoiceID = invoice.InvoiceID,
                    PartID = part.PartID,
                    Quantity = qty,
                    UnitPrice = part.Price,
                    LineTotal = part.Price * qty,
                });
            }
        }

        db.InvoiceItems.AddRange(invoiceItems);
        await db.SaveChangesAsync();

        Console.WriteLine($"✅ Demo data seeded: {invoices.Count} invoices, {parts.Count} parts, {invoiceItems.Count} invoice items.");
    }
}
