using VehicleParts.Application.DTOs;
using VehicleParts.Application.Interface.IRepository;
using VehicleParts.Application.Interface.IServices;
using VehicleParts.Domain.Models;

namespace VehicleParts.Infrastructure.Services;

// Feature 3: this service handles all the parts inventory logic
// it uses PartRepository to read and write parts data in the database
public class PartService : IPartService
{
    private readonly IPartRepository _partRepo;

    public PartService(IPartRepository partRepo)
    {
        _partRepo = partRepo;
    }

    // get all active parts and send them to the frontend
    public async Task<IEnumerable<PartResponseDto>> GetAllPartsAsync()
    {
        var parts = await _partRepo.GetAllAsync();
        return parts.Select(MapToDto);
    }

    // search parts by keyword (checks name and category)
    public async Task<IEnumerable<PartResponseDto>> SearchPartsAsync(string keyword)
    {
        var parts = await _partRepo.SearchAsync(keyword);
        return parts.Select(MapToDto);
    }

    // get one specific part by its ID
    public async Task<PartResponseDto?> GetPartByIdAsync(int partId)
    {
        var part = await _partRepo.GetByIdAsync(partId);
        if (part == null) return null;
        return MapToDto(part);
    }

    // add a brand new part to the inventory
    public async Task<PartResponseDto> CreatePartAsync(CreatePartDto dto)
    {
        // create the new part object from the data the frontend sent us
        var part = new Part
        {
            VendorID          = dto.VendorID,
            Name              = dto.Name,
            Description       = dto.Description,
            Category          = dto.Category,
            PartNumber        = dto.PartNumber,
            Price             = dto.Price,
            Stock             = dto.Stock,
            LowStockThreshold = dto.LowStockThreshold,
            IsActive          = true,
            CreatedAt         = DateTime.UtcNow
        };

        await _partRepo.AddAsync(part);
        await _partRepo.SaveChangesAsync();
        return MapToDto(part);
    }

    // update the details of an existing part
    public async Task<PartResponseDto?> UpdatePartAsync(int partId, UpdatePartDto dto)
    {
        var part = await _partRepo.GetByIdAsync(partId);
        if (part == null) return null;

        // only change the fields that were actually provided by the admin
        if (dto.Name              != null) part.Name              = dto.Name;
        if (dto.Description       != null) part.Description       = dto.Description;
        if (dto.Category          != null) part.Category          = dto.Category;
        if (dto.Price             != null) part.Price             = dto.Price.Value;
        if (dto.LowStockThreshold != null) part.LowStockThreshold = dto.LowStockThreshold.Value;

        await _partRepo.UpdateAsync(part);
        await _partRepo.SaveChangesAsync();
        return MapToDto(part);
    }

    // delete a part from the inventory
    public async Task<bool> DeletePartAsync(int partId)
    {
        var part = await _partRepo.GetByIdAsync(partId);
        if (part == null) return false;

        await _partRepo.DeleteAsync(part);
        await _partRepo.SaveChangesAsync();
        return true;
    }

    // add more stock to an existing part and record it in StockTransactions
    public async Task<PartResponseDto?> StockInAsync(int partId, StockInDto dto)
    {
        var part = await _partRepo.GetByIdAsync(partId);
        if (part == null) return null;

        // increase the stock count
        part.Stock += dto.Quantity;

        await _partRepo.UpdateAsync(part);

        // save a record of this stock addition for audit history
        var transaction = new StockTransaction
        {
            PartID    = part.PartID,
            Quantity  = dto.Quantity,
            Reason    = dto.Reason,
            CreatedAt = DateTime.UtcNow
        };
        await _partRepo.AddStockTransactionAsync(transaction);
        await _partRepo.SaveChangesAsync();

        return MapToDto(part);
    }

    // helper method to convert Part model into PartResponseDto
    private static PartResponseDto MapToDto(Part part)
    {
        return new PartResponseDto
        {
            PartID            = part.PartID,
            VendorID          = part.VendorID,
            VendorName        = part.Vendor?.Name ?? string.Empty,
            Name              = part.Name,
            Description       = part.Description,
            Category          = part.Category,
            PartNumber        = part.PartNumber,
            Price             = part.Price,
            Stock             = part.Stock,
            LowStockThreshold = part.LowStockThreshold,
            IsActive          = part.IsActive,
            IsLowStock        = part.Stock <= part.LowStockThreshold,
            CreatedAt         = part.CreatedAt
        };
    }
}
