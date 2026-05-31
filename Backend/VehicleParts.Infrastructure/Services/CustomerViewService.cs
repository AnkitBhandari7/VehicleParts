namespace VehicleParts.Infrastructure.Services;

using VehicleParts.Application.DTOs;
using VehicleParts.Application.Interface.IRepository;
using VehicleParts.Application.Interface.IServices;

public class CustomerViewService : ICustomerViewService
{
    private readonly ICustomerViewRepository _repository;

    public CustomerViewService(ICustomerViewRepository repository)
    {
        _repository = repository;
    }

    public async Task<CustomerDetailDto?> GetCustomerByIdAsync(int customerId)
    {
        var customer = await _repository.GetCustomerByIdAsync(customerId);
        if (customer == null) return null;

        return new CustomerDetailDto
        {
            CustomerID = customer.CustomerID,
            FirstName = customer.FirstName,
            LastName = customer.LastName,
            Phone = customer.Phone,
            Address = customer.Address,
            DateOfBirth = customer.DateOfBirth,
            TotalSpent = customer.TotalSpent,
            LoyaltyPoints = customer.LoyaltyPoints,
            CreditBalance = customer.CreditBalance,
            CreditStatus = customer.CreditStatus,
            TotalVisits = customer.TotalVisits,
            RegisteredAt = customer.RegisteredAt
        };
    }

    public async Task<IEnumerable<CustomerVehicleDto>> GetCustomerVehiclesAsync(int customerId)
    {
        var vehicles = await _repository.GetCustomerVehiclesAsync(customerId);

        return vehicles.Select(v => new CustomerVehicleDto
        {
            VehicleID = v.VehicleID,
            VehicleNumber = v.VehicleNumber,
            Make = v.Make,
            Model = v.Model,
            Year = v.Year,
            Color = v.Color,
            VIN = v.VIN,
            Notes = v.Notes
        });
    }

    public async Task<IEnumerable<PurchaseHistoryDto>> GetCustomerPurchaseHistoryAsync(int customerId)
    {
        var invoices = await _repository.GetCustomerPurchaseHistoryAsync(customerId);

        return invoices.Select(i => new PurchaseHistoryDto
        {
            InvoiceID = i.InvoiceID,
            SubTotal = i.SubTotal,
            DiscountAmount = i.DiscountAmount,
            TotalAmount = i.TotalAmount,
            IsPaid = i.IsPaid,
            IsCreditSale = i.IsCreditSale,
            LoyaltyDiscountApplied = i.LoyaltyDiscountApplied,
            DueDate = i.DueDate,
            Notes = i.Notes,
            CreatedAt = i.CreatedAt,
            Items = i.InvoiceItems.Select(ii => new PurchaseHistoryItemDto
            {
                PartName = ii.Part.Name,
                Quantity = ii.Quantity,
                UnitPrice = ii.UnitPrice,
                LineTotal = ii.LineTotal
            }).ToList()
        });
    }
}