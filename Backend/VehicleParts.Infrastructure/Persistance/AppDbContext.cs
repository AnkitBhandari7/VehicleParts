using Microsoft.EntityFrameworkCore;
using VehicleParts.Domain.Models;

namespace VehicleParts.Infrastructure.Persistance;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // all tables in the database
    public DbSet<User> Users => Set<User>();
    public DbSet<StaffDetail> StaffDetails => Set<StaffDetail>();
    public DbSet<CustomerDetail> CustomerDetails => Set<CustomerDetail>();
    public DbSet<Vehicle> Vehicles => Set<Vehicle>();
    public DbSet<Vendor> Vendors => Set<Vendor>();
    public DbSet<Part> Parts => Set<Part>();
    public DbSet<Invoice> Invoices => Set<Invoice>();
    public DbSet<InvoiceItem> InvoiceItems => Set<InvoiceItem>();
    public DbSet<LoyaltyTransaction> LoyaltyTransactions => Set<LoyaltyTransaction>();
    public DbSet<PartRequest> PartRequests => Set<PartRequest>();
    public DbSet<Appointment> Appointments => Set<Appointment>();
    public DbSet<ServiceReview> ServiceReviews => Set<ServiceReview>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<PurchaseInvoice> PurchaseInvoices => Set<PurchaseInvoice>();

    // Feature 3 - Parts Inventory: tracks every stock-in event for a part
    public DbSet<StockTransaction> StockTransactions => Set<StockTransaction>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // primary keys for each entity
        modelBuilder.Entity<User>().HasKey(u => u.UserID);
        modelBuilder.Entity<StaffDetail>().HasKey(s => s.StaffID);
        modelBuilder.Entity<CustomerDetail>().HasKey(c => c.CustomerID);
        modelBuilder.Entity<Vehicle>().HasKey(v => v.VehicleID);
        modelBuilder.Entity<Vendor>().HasKey(v => v.VendorID);
        modelBuilder.Entity<Part>().HasKey(p => p.PartID);
        modelBuilder.Entity<Invoice>().HasKey(i => i.InvoiceID);
        modelBuilder.Entity<InvoiceItem>().HasKey(i => i.ID);
        modelBuilder.Entity<LoyaltyTransaction>().HasKey(l => l.ID);
        modelBuilder.Entity<PartRequest>().HasKey(p => p.ID);
        modelBuilder.Entity<Appointment>().HasKey(a => a.AppointmentID);
        modelBuilder.Entity<ServiceReview>().HasKey(s => s.ReviewID);
        modelBuilder.Entity<Notification>().HasKey(n => n.NotificationID);
        modelBuilder.Entity<PurchaseInvoice>().HasKey(p => p.PurchaseInvoiceID);

        // Feature 3 - primary key for StockTransaction
        modelBuilder.Entity<StockTransaction>().HasKey(s => s.ID);

        // relationships
        modelBuilder.Entity<StaffDetail>()
            .HasOne(s => s.User)
            .WithOne(u => u.StaffDetail)
            .HasForeignKey<StaffDetail>(s => s.UserID);

        modelBuilder.Entity<CustomerDetail>()
            .HasOne(c => c.User)
            .WithOne(u => u.CustomerDetail)
            .HasForeignKey<CustomerDetail>(c => c.UserID);

        modelBuilder.Entity<Notification>()
            .HasOne(n => n.User)
            .WithMany(u => u.Notifications)
            .HasForeignKey(n => n.UserID);

        modelBuilder.Entity<Vehicle>()
            .HasOne(v => v.CustomerDetail)
            .WithMany(c => c.Vehicles)
            .HasForeignKey(v => v.CustomerID);

        modelBuilder.Entity<Part>()
            .HasOne(p => p.Vendor)
            .WithMany(v => v.Parts)
            .HasForeignKey(p => p.VendorID);

        modelBuilder.Entity<PurchaseInvoice>()
            .HasOne(p => p.Vendor)
            .WithMany(v => v.PurchaseInvoices)
            .HasForeignKey(p => p.VendorID);

        modelBuilder.Entity<PurchaseInvoice>()
            .HasOne(p => p.Part)
            .WithMany(p => p.PurchaseInvoices)
            .HasForeignKey(p => p.PartID);

        modelBuilder.Entity<Invoice>()
            .HasOne(i => i.CustomerDetail)
            .WithMany(c => c.Invoices)
            .HasForeignKey(i => i.CustomerID);

        modelBuilder.Entity<Invoice>()
            .HasOne(i => i.StaffDetail)
            .WithMany(s => s.Invoices)
            .HasForeignKey(i => i.StaffID);

        modelBuilder.Entity<InvoiceItem>()
            .HasOne(i => i.Invoice)
            .WithMany(i => i.InvoiceItems)
            .HasForeignKey(i => i.InvoiceID);

        modelBuilder.Entity<InvoiceItem>()
            .HasOne(i => i.Part)
            .WithMany(p => p.InvoiceItems)
            .HasForeignKey(i => i.PartID);

        modelBuilder.Entity<LoyaltyTransaction>()
            .HasOne(l => l.CustomerDetail)
            .WithMany(c => c.LoyaltyTransactions)
            .HasForeignKey(l => l.CustomerID);

        modelBuilder.Entity<LoyaltyTransaction>()
            .HasOne(l => l.Invoice)
            .WithMany(i => i.LoyaltyTransactions)
            .HasForeignKey(l => l.InvoiceID);

        modelBuilder.Entity<PartRequest>()
            .HasOne(p => p.CustomerDetail)
            .WithMany(c => c.PartRequests)
            .HasForeignKey(p => p.CustomerID);

        modelBuilder.Entity<Appointment>()
            .HasOne(a => a.CustomerDetail)
            .WithMany(c => c.Appointments)
            .HasForeignKey(a => a.CustomerID);

        modelBuilder.Entity<Appointment>()
            .HasOne(a => a.StaffDetail)
            .WithMany(s => s.Appointments)
            .HasForeignKey(a => a.StaffID);

        modelBuilder.Entity<Appointment>()
            .HasOne(a => a.Vehicle)
            .WithMany()
            .HasForeignKey(a => a.VehicleID);

        modelBuilder.Entity<ServiceReview>()
            .HasOne(r => r.CustomerDetail)
            .WithMany(c => c.ServiceReviews)
            .HasForeignKey(r => r.CustomerID);

        modelBuilder.Entity<ServiceReview>()
            .HasOne(r => r.Appointment)
            .WithMany(a => a.ServiceReviews)
            .HasForeignKey(r => r.AppointmentID);

        // decimal precision for money/price columns
        modelBuilder.Entity<Part>().Property(p => p.Price).HasPrecision(18, 2);
        modelBuilder.Entity<Invoice>().Property(i => i.SubTotal).HasPrecision(18, 2);
        modelBuilder.Entity<Invoice>().Property(i => i.DiscountPercent).HasPrecision(18, 2);
        modelBuilder.Entity<Invoice>().Property(i => i.DiscountAmount).HasPrecision(18, 2);
        modelBuilder.Entity<Invoice>().Property(i => i.TotalAmount).HasPrecision(18, 2);
        modelBuilder.Entity<InvoiceItem>().Property(i => i.UnitPrice).HasPrecision(18, 2);
        modelBuilder.Entity<InvoiceItem>().Property(i => i.LineTotal).HasPrecision(18, 2);
        modelBuilder.Entity<CustomerDetail>().Property(c => c.TotalSpent).HasPrecision(18, 2);
        modelBuilder.Entity<CustomerDetail>().Property(c => c.CreditBalance).HasPrecision(18, 2);
        modelBuilder.Entity<PurchaseInvoice>().Property(p => p.UnitCost).HasPrecision(18, 2);
        modelBuilder.Entity<PurchaseInvoice>().Property(p => p.TotalCost).HasPrecision(18, 2);
    }
}