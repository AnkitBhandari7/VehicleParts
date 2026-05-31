namespace VehicleParts.Domain.Models;

public class User
{
    public int UserID { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public StaffDetail? StaffDetail { get; set; }
    public CustomerDetail? CustomerDetail { get; set; }
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
}

public class StaffDetail
{
    public int StaffID { get; set; }
    public int UserID { get; set; }
    public User User { get; set; } = null!;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Position { get; set; } = string.Empty;
    public DateTime HireDate { get; set; }
    public string Status { get; set; } = "Active";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
    public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
}

public class CustomerDetail
{
    public int CustomerID { get; set; }
    public int UserID { get; set; }
    public User User { get; set; } = null!;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
    public decimal TotalSpent { get; set; } = 0;
    public int LoyaltyPoints { get; set; } = 0;
    public decimal CreditBalance { get; set; } = 0;
    public string CreditStatus { get; set; } = "Good";
    public DateTime? LastCreditReminderSent { get; set; }
    public DateTime RegisteredAt { get; set; } = DateTime.UtcNow;
    public int TotalVisits { get; set; } = 0;

    public ICollection<Vehicle> Vehicles { get; set; } = new List<Vehicle>();
    public ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
    public ICollection<LoyaltyTransaction> LoyaltyTransactions { get; set; } = new List<LoyaltyTransaction>();
    public ICollection<PartRequest> PartRequests { get; set; } = new List<PartRequest>();
    public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
    public ICollection<ServiceReview> ServiceReviews { get; set; } = new List<ServiceReview>();
}

public class Vehicle
{
    public int VehicleID { get; set; }
    public int CustomerID { get; set; }
    public CustomerDetail CustomerDetail { get; set; } = null!;
    public string VehicleNumber { get; set; } = string.Empty;
    public string Make { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public string Year { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
    public string VIN { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class Vendor
{
    public int VendorID { get; set; }
    public string Name { get; set; } = string.Empty;
    public string ContactPerson { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Part> Parts { get; set; } = new List<Part>();
    public ICollection<PurchaseInvoice> PurchaseInvoices { get; set; } = new List<PurchaseInvoice>();
}

public class Part
{
    public int PartID { get; set; }
    public int VendorID { get; set; }
    public Vendor Vendor { get; set; } = null!;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string PartNumber { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public int LowStockThreshold { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<InvoiceItem> InvoiceItems { get; set; } = new List<InvoiceItem>();
    public ICollection<PartRequest> PartRequests { get; set; } = new List<PartRequest>();
    public ICollection<PurchaseInvoice> PurchaseInvoices { get; set; } = new List<PurchaseInvoice>();
}

public class PurchaseInvoice
{
    public int PurchaseInvoiceID { get; set; }
    public int VendorID { get; set; }
    public Vendor Vendor { get; set; } = null!;
    public int PartID { get; set; }
    public Part Part { get; set; } = null!;
    public int QuantityPurchased { get; set; }
    public decimal UnitCost { get; set; }
    public decimal TotalCost { get; set; }
    public string Notes { get; set; } = string.Empty;
    public DateTime PurchasedAt { get; set; } = DateTime.UtcNow;
}

public class Invoice
{
    public int InvoiceID { get; set; }
    public int CustomerID { get; set; }
    public CustomerDetail CustomerDetail { get; set; } = null!;
    public int StaffID { get; set; }
    public StaffDetail StaffDetail { get; set; } = null!;
    public string Type { get; set; } = string.Empty;
    public decimal SubTotal { get; set; }
    public decimal DiscountPercent { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public bool LoyaltyDiscountApplied { get; set; } = false;
    public bool IsPaid { get; set; } = false;
    public bool IsCreditSale { get; set; } = false;
    public DateTime? DueDate { get; set; }
    public string Notes { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<InvoiceItem> InvoiceItems { get; set; } = new List<InvoiceItem>();
    public ICollection<LoyaltyTransaction> LoyaltyTransactions { get; set; } = new List<LoyaltyTransaction>();
}

public class InvoiceItem
{
    public int ID { get; set; }
    public int InvoiceID { get; set; }
    public Invoice Invoice { get; set; } = null!;
    public int PartID { get; set; }
    public Part Part { get; set; } = null!;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal LineTotal { get; set; }
}

public class LoyaltyTransaction
{
    public int ID { get; set; }
    public int CustomerID { get; set; }
    public CustomerDetail CustomerDetail { get; set; } = null!;
    public int InvoiceID { get; set; }
    public Invoice Invoice { get; set; } = null!;
    public int PointsEarned { get; set; }
    public int PointsUsed { get; set; }
    public string Reason { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class PartRequest
{
    public int ID { get; set; }
    public int CustomerID { get; set; }
    public CustomerDetail CustomerDetail { get; set; } = null!;
    public string PartName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public string Status { get; set; } = "Pending";
    public string Notes { get; set; } = string.Empty;
    public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
}

public class Appointment
{
    public int AppointmentID { get; set; }
    public int CustomerID { get; set; }
    public CustomerDetail CustomerDetail { get; set; } = null!;
    public int StaffID { get; set; }
    public StaffDetail StaffDetail { get; set; } = null!;
    public int VehicleID { get; set; }
    public Vehicle Vehicle { get; set; } = null!;
    public DateTime AppointmentDate { get; set; }
    public string TimeSlot { get; set; } = string.Empty;
    public string ServiceDescription { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<ServiceReview> ServiceReviews { get; set; } = new List<ServiceReview>();
}

public class ServiceReview
{
    public int ReviewID { get; set; }
    public int CustomerID { get; set; }
    public CustomerDetail CustomerDetail { get; set; } = null!;
    public int AppointmentID { get; set; }
    public Appointment Appointment { get; set; } = null!;
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
    public DateTime ReviewedAt { get; set; } = DateTime.UtcNow;
}

public class Notification
{
    public int NotificationID { get; set; }
    public int UserID { get; set; }
    public User User { get; set; } = null!;
    public string Type { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public bool IsRead { get; set; } = false;
    public bool EmailSent { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

// Feature 3 - Parts Inventory: records every time stock is added for a part
public class StockTransaction
{
    public int ID { get; set; }
    public int PartID { get; set; }
    public Part Part { get; set; } = null!;

    // how many units were added to stock
    public int Quantity { get; set; }

    // reason like "Purchase" or "Adjustment"
    public string Reason { get; set; } = "Purchase";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
