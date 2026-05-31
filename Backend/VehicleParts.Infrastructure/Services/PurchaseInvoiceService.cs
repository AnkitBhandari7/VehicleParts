using Microsoft.EntityFrameworkCore;
using VehicleParts.Application.DTOs;
using VehicleParts.Application.Interface.IRepository;
using VehicleParts.Application.Interface.IServices;
using VehicleParts.Domain.Models;
using VehicleParts.Infrastructure.Persistance;

namespace VehicleParts.Infrastructure.Services;

public class PurchaseInvoiceService : IPurchaseInvoiceService
{
    private readonly IPurchaseInvoiceRepository _purchaseInvoiceRepo;
    private readonly AppDbContext _context;

    public PurchaseInvoiceService(IPurchaseInvoiceRepository purchaseInvoiceRepo, AppDbContext context)
    {
        _purchaseInvoiceRepo = purchaseInvoiceRepo;
        _context             = context;
    }

    public async Task<IEnumerable<PurchaseInvoiceResponseDto>> GetAllAsync()
    {
        var invoices = await _purchaseInvoiceRepo.GetAllAsync();
        return invoices.Select(MapToDto);
    }

    public async Task<IEnumerable<PurchaseInvoiceResponseDto>> GetByVendorAsync(int vendorId)
    {
        var invoices = await _purchaseInvoiceRepo.GetByVendorAsync(vendorId);
        return invoices.Select(MapToDto);
    }

    public async Task<PurchaseInvoiceResponseDto?> GetByIdAsync(int id)
    {
        var invoice = await _purchaseInvoiceRepo.GetByIdAsync(id);
        return invoice is null ? null : MapToDto(invoice);
    }

    public async Task<PurchaseInvoiceResponseDto> CreateAsync(CreatePurchaseInvoiceDto dto)
    {
        // Validate part exists
        var part = await _context.Parts.FindAsync(dto.PartID)
            ?? throw new KeyNotFoundException($"Part with ID {dto.PartID} was not found.");

        // Validate vendor is active
        var vendorActive = await _context.Vendors
            .AnyAsync(v => v.VendorID == dto.VendorID && v.IsActive);

        if (!vendorActive)
            throw new KeyNotFoundException($"Vendor with ID {dto.VendorID} was not found or is inactive.");

        var totalCost = dto.QuantityPurchased * dto.UnitCost;

        var invoice = new PurchaseInvoice
        {
            VendorID          = dto.VendorID,
            PartID            = dto.PartID,
            QuantityPurchased = dto.QuantityPurchased,
            UnitCost          = dto.UnitCost,
            TotalCost         = totalCost,
            Notes             = dto.Notes
        };

        // Increment part stock — EF tracks the change since `part` was fetched from this same context.
        // Both the stock update and the new invoice are saved atomically in one SaveChangesAsync call.
        part.Stock += dto.QuantityPurchased;

        var created = await _purchaseInvoiceRepo.CreateAsync(invoice);

        // Reload with navigation properties for the response
        var full = await _purchaseInvoiceRepo.GetByIdAsync(created.PurchaseInvoiceID);
        return MapToDto(full!);
    }

    private static PurchaseInvoiceResponseDto MapToDto(PurchaseInvoice p) => new()
    {
        PurchaseInvoiceID = p.PurchaseInvoiceID,
        VendorID          = p.VendorID,
        VendorName        = p.Vendor?.Name ?? string.Empty,
        PartID            = p.PartID,
        PartName          = p.Part?.Name ?? string.Empty,
        PartNumber        = p.Part?.PartNumber ?? string.Empty,
        QuantityPurchased = p.QuantityPurchased,
        UnitCost          = p.UnitCost,
        TotalCost         = p.TotalCost,
        UpdatedStockLevel = p.Part?.Stock ?? 0,
        Notes             = p.Notes,
        PurchasedAt       = p.PurchasedAt
    };
}
