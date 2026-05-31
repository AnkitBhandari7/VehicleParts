using VehicleParts.Application.DTOs;

namespace VehicleParts.Application.Interface.IServices;

// this is the contract for Feature 3 - Parts inventory management

public interface IPartService
{
    
    Task<IEnumerable<PartResponseDto>> GetAllPartsAsync();


    Task<IEnumerable<PartResponseDto>> SearchPartsAsync(string keyword);

    Task<PartResponseDto?> GetPartByIdAsync(int partId);

  
    Task<PartResponseDto> CreatePartAsync(CreatePartDto dto);

   
    Task<PartResponseDto?> UpdatePartAsync(int partId, UpdatePartDto dto);

    
    Task<bool> DeletePartAsync(int partId);

  
    Task<PartResponseDto?> StockInAsync(int partId, StockInDto dto);
}
