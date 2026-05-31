using VehicleParts.Application.DTOs;
using VehicleParts.Application.Interface.IRepository;
using VehicleParts.Application.Interface.IServices;

namespace VehicleParts.Infrastructure.Services;

public class CustomerHistoryService : ICustomerHistoryService
{
    private readonly ICustomerHistoryRepository _customerHistoryRepository;

    public CustomerHistoryService(ICustomerHistoryRepository customerHistoryRepository)
    {
        _customerHistoryRepository = customerHistoryRepository;
    }

    /// <summary>
    /// Gets complete history (purchases + services) for a customer.
    /// </summary>
    public async Task<CustomerFullHistoryDto?> GetFullHistoryAsync(int customerId)
    {
        var customer = await _customerHistoryRepository.GetCustomerByIdAsync(customerId);
        if (customer == null) return null;

        var purchases = await _customerHistoryRepository.GetPurchaseHistoryAsync(customerId);
        var services = await _customerHistoryRepository.GetServiceHistoryAsync(customerId);

        return new CustomerFullHistoryDto
        {
            CustomerID = customer.CustomerID,
            CustomerName = $"{customer.FirstName} {customer.LastName}",
            TotalSpent = customer.TotalSpent,
            TotalVisits = customer.TotalVisits,
            PurchaseHistory = purchases.Select(MapToPurchaseDto).ToList(),
            ServiceHistory = services.Select(MapToServiceDto).ToList()
        };
    }

    /// <summary>
    /// Gets only purchase history for a customer.
    /// </summary>
    public async Task<IEnumerable<CustomerPurchaseHistoryDto>> GetPurchaseHistoryAsync(int customerId)
    {
        var purchases = await _customerHistoryRepository.GetPurchaseHistoryAsync(customerId);
        return purchases.Select(MapToPurchaseDto);
    }

    /// <summary>
    /// Gets only service history for a customer.
    /// </summary>
    public async Task<IEnumerable<CustomerServiceHistoryDto>> GetServiceHistoryAsync(int customerId)
    {
        var services = await _customerHistoryRepository.GetServiceHistoryAsync(customerId);
        return services.Select(MapToServiceDto);
    }

    // ---------- MAPPERS ----------

    private static CustomerPurchaseHistoryDto MapToPurchaseDto(
        VehicleParts.Domain.Models.Invoice invoice)
    {
        return new CustomerPurchaseHistoryDto
        {
            InvoiceID = invoice.InvoiceID,
            Type = invoice.Type,
            SubTotal = invoice.SubTotal,
            DiscountAmount = invoice.DiscountAmount,
            TotalAmount = invoice.TotalAmount,
            LoyaltyDiscountApplied = invoice.LoyaltyDiscountApplied,
            IsPaid = invoice.IsPaid,
            IsCreditSale = invoice.IsCreditSale,
            DueDate = invoice.DueDate,
            Notes = invoice.Notes,
            CreatedAt = invoice.CreatedAt,
            StaffName = $"{invoice.StaffDetail.FirstName} {invoice.StaffDetail.LastName}",
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

    private static CustomerServiceHistoryDto MapToServiceDto(
        VehicleParts.Domain.Models.Appointment appointment)
    {
        return new CustomerServiceHistoryDto
        {
            AppointmentID = appointment.AppointmentID,
            AppointmentDate = appointment.AppointmentDate,
            TimeSlot = appointment.TimeSlot,
            ServiceDescription = appointment.ServiceDescription,
            Status = appointment.Status,
            StaffName = $"{appointment.StaffDetail.FirstName} {appointment.StaffDetail.LastName}",
            VehicleNumber = appointment.Vehicle?.VehicleNumber ?? string.Empty,
            VehicleMake = appointment.Vehicle?.Make ?? string.Empty,
            VehicleModel = appointment.Vehicle?.Model ?? string.Empty,
            CreatedAt = appointment.CreatedAt,
            Reviews = appointment.ServiceReviews.Select(r => new ServiceReviewDto
            {
                ReviewID = r.ReviewID,
                Rating = r.Rating,
                Comment = r.Comment,
                ReviewedAt = r.ReviewedAt
            }).ToList()
        };
    }
}