using Microsoft.EntityFrameworkCore;
using VehicleParts.Application.DTOs;
using VehicleParts.Application.Interface.IRepository;
using VehicleParts.Application.Interface.IServices;
using VehicleParts.Domain.Models;
using VehicleParts.Infrastructure.Persistance;

namespace VehicleParts.Infrastructure.Services;

public class InvoiceService : IInvoiceService
{
    private readonly IInvoiceRepository _invoiceRepository;
    private readonly AppDbContext _context;
    private readonly IEmailSender _emailSender;

    public InvoiceService(
        IInvoiceRepository invoiceRepository,
        AppDbContext context,
        IEmailSender emailSender)
    {
        _invoiceRepository = invoiceRepository;
        _context = context;
        _emailSender = emailSender;
    }

    /// <summary>
    /// Creates a sale invoice:
    /// - Validates customer, staff, parts
    /// - Reduces stock for each part
    /// - Applies 10% loyalty discount if subtotal > 5000 (Feature 16)
    /// - Records loyalty transaction
    /// - Updates customer TotalSpent
    /// </summary>
    public async Task<InvoiceResponseDto> CreateSaleInvoiceAsync(CreateInvoiceRequestDto request)
    {
        // --- Validate Customer ---
        var customer = await _context.CustomerDetails
            .FirstOrDefaultAsync(c => c.CustomerID == request.CustomerID)
            ?? throw new Exception($"Customer with ID {request.CustomerID} not found.");

        // --- Validate Staff ---
        var staff = await _context.StaffDetails
            .FirstOrDefaultAsync(s => s.StaffID == request.StaffID)
            ?? throw new Exception($"Staff with ID {request.StaffID} not found.");

        // --- Validate Items ---
        if (request.Items == null || request.Items.Count == 0)
            throw new Exception("Invoice must have at least one item.");

        // --- Build Invoice Items & Calculate SubTotal ---
        var invoiceItems = new List<InvoiceItem>();
        decimal subTotal = 0;

        foreach (var item in request.Items)
        {
            // Validate part exists and is active
            var part = await _context.Parts
                .FirstOrDefaultAsync(p => p.PartID == item.PartID && p.IsActive)
                ?? throw new Exception($"Part with ID {item.PartID} not found or inactive.");

            // Validate stock availability
            if (part.Stock < item.Quantity)
                throw new Exception($"Insufficient stock for part '{part.Name}'. Available: {part.Stock}, Requested: {item.Quantity}.");

            var lineTotal = part.Price * item.Quantity;
            subTotal += lineTotal;

            invoiceItems.Add(new InvoiceItem
            {
                PartID = part.PartID,
                Quantity = item.Quantity,
                UnitPrice = part.Price,
                LineTotal = lineTotal
            });

            // Reduce stock
            part.Stock -= item.Quantity;
            _context.Parts.Update(part);
        }

        // --- Feature 16: Loyalty Discount ---
        // Apply 10% discount if subtotal exceeds 5000
        decimal discountPercent = 0;
        decimal discountAmount = 0;
        bool loyaltyDiscountApplied = false;

        if (subTotal > 5000)
        {
            discountPercent = 10;
            discountAmount = subTotal * 0.10m;
            loyaltyDiscountApplied = true;
        }

        decimal totalAmount = subTotal - discountAmount;

        // --- Create Invoice ---
        var invoice = new Invoice
        {
            CustomerID = request.CustomerID,
            StaffID = request.StaffID,
            Type = request.Type,
            SubTotal = subTotal,
            DiscountPercent = discountPercent,
            DiscountAmount = discountAmount,
            TotalAmount = totalAmount,
            LoyaltyDiscountApplied = loyaltyDiscountApplied,
            IsPaid = !request.IsCreditSale,
            IsCreditSale = request.IsCreditSale,
            DueDate = request.IsCreditSale ? request.DueDate : null,
            Notes = request.Notes,
            CreatedAt = DateTime.UtcNow,
            InvoiceItems = invoiceItems
        };

        var createdInvoice = await _invoiceRepository.CreateInvoiceAsync(invoice);

        // --- Update Customer TotalSpent ---
        customer.TotalSpent += totalAmount;
        customer.TotalVisits += 1;

        // --- Handle Credit Sale ---
        if (request.IsCreditSale)
        {
            customer.CreditBalance += totalAmount;
            customer.CreditStatus = "Pending";
        }

        _context.CustomerDetails.Update(customer);

        // --- Record Loyalty Transaction if discount was applied ---
        if (loyaltyDiscountApplied)
        {
            var loyaltyTransaction = new LoyaltyTransaction
            {
                CustomerID = request.CustomerID,
                InvoiceID = createdInvoice.InvoiceID,
                PointsEarned = 0,
                PointsUsed = 0,
                Reason = $"10% loyalty discount applied on purchase over 5000. Saved: {discountAmount:F2}",
                CreatedAt = DateTime.UtcNow
            };
            _context.LoyaltyTransactions.Add(loyaltyTransaction);
        }

        await _context.SaveChangesAsync();

        // --- Return Response ---
        return MapToResponseDto(createdInvoice, customer, staff);
    }

    /// <summary>
    /// Gets a single invoice by ID.
    /// </summary>
    public async Task<InvoiceResponseDto?> GetInvoiceByIdAsync(int invoiceId)
    {
        var invoice = await _invoiceRepository.GetInvoiceByIdAsync(invoiceId);
        if (invoice == null) return null;

        return MapToResponseDto(invoice, invoice.CustomerDetail, invoice.StaffDetail);
    }

    /// <summary>
    /// Gets all invoices for a specific customer.
    /// </summary>
    public async Task<IEnumerable<InvoiceResponseDto>> GetInvoicesByCustomerIdAsync(int customerId)
    {
        var invoices = await _invoiceRepository.GetInvoicesByCustomerIdAsync(customerId);
        return invoices.Select(i => MapToResponseDto(i, i.CustomerDetail, i.StaffDetail));
    }

    /// <summary>
    /// Maps Invoice entity to InvoiceResponseDto.
    /// </summary>
    private static InvoiceResponseDto MapToResponseDto(
        Invoice invoice,
        CustomerDetail customer,
        StaffDetail staff)
    {
        return new InvoiceResponseDto
        {
            InvoiceID = invoice.InvoiceID,
            CustomerID = invoice.CustomerID,
            CustomerName = $"{customer.FirstName} {customer.LastName}",
            StaffID = invoice.StaffID,
            StaffName = $"{staff.FirstName} {staff.LastName}",
            Type = invoice.Type,
            SubTotal = invoice.SubTotal,
            DiscountPercent = invoice.DiscountPercent,
            DiscountAmount = invoice.DiscountAmount,
            TotalAmount = invoice.TotalAmount,
            LoyaltyDiscountApplied = invoice.LoyaltyDiscountApplied,
            IsPaid = invoice.IsPaid,
            IsCreditSale = invoice.IsCreditSale,
            DueDate = invoice.DueDate,
            Notes = invoice.Notes,
            CreatedAt = invoice.CreatedAt,
            Items = invoice.InvoiceItems.Select(ii => new InvoiceItemResponseDto
            {
                PartID = ii.PartID,
                PartName = ii.Part?.Name ?? string.Empty,
                Quantity = ii.Quantity,
                UnitPrice = ii.UnitPrice,
                LineTotal = ii.LineTotal
            }).ToList()
        };
    }

    /// <summary>
    /// Feature 11 — Sends a sales invoice to the customer's email via Mailtrap SMTP.
    /// Also creates a Notification row with EmailSent = true.
    /// </summary>
    public async Task<EmailResultDto> SendInvoiceByEmailAsync(SendInvoiceEmailDto request)
    {
        var invoice = await _invoiceRepository.GetInvoiceByIdAsync(request.InvoiceID);
        if (invoice == null)
            return new EmailResultDto { Success = false, Message = "Invoice not found." };

        var customer = await _context.CustomerDetails
            .FirstOrDefaultAsync(c => c.CustomerID == invoice.CustomerID);
        if (customer == null)
            return new EmailResultDto { Success = false, Message = "Customer not found." };

        var user = await _context.Users.FindAsync(customer.UserID);
        if (user == null || string.IsNullOrEmpty(user.Email))
            return new EmailResultDto { Success = false, Message = "Customer email not found." };

        string htmlBody = $@"
            <div style='font-family: Arial, sans-serif; border: 1px solid #ddd; padding: 20px; max-width: 600px;'>
                <h2 style='color: #2c3e50;'>Vehicle Parts Invoice</h2>
                <hr/>
                <p><strong>Invoice ID:</strong> {invoice.InvoiceID}</p>
                <p><strong>Customer:</strong> {customer.FirstName} {customer.LastName}</p>
                <p><strong>Date:</strong> {invoice.CreatedAt:yyyy-MM-dd HH:mm}</p>
                <hr/>
                <p>{request.Description}</p>
                <table style='width: 100%; border-collapse: collapse;'>
                    <tr style='background: #f8f9fa;'>
                        <th style='text-align: left; padding: 8px;'>Total Amount</th>
                        <td style='text-align: right; padding: 8px; font-weight: bold;'>${invoice.TotalAmount:N2}</td>
                    </tr>
                </table>
                <br/>
                <p style='font-size: 12px; color: #7f8c8d;'>Thank you for your business!</p>
            </div>";

        try
        {
            await _emailSender.SendEmailAsync(user.Email, request.Subject, htmlBody);

            var notification = new Notification
            {
                UserID = customer.UserID,
                Type = "InvoiceSent",
                Message = $"Invoice #{invoice.InvoiceID} was sent to your email.",
                EmailSent = true,
                CreatedAt = DateTime.UtcNow
            };
            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            return new EmailResultDto { Success = true, Message = "Invoice email sent successfully." };
        }
        catch (Exception ex)
        {
            return new EmailResultDto { Success = false, Message = $"Failed to send email: {ex.Message}" };
        }
    }
}