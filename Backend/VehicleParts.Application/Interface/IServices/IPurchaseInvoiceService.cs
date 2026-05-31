using VehicleParts.Application.DTOs;

namespace VehicleParts.Application.Interface.IServices;

public interface IPurchaseInvoiceService
{
    Task<IEnumerable<PurchaseInvoiceResponseDto>> GetAllAsync();
    Task<IEnumerable<PurchaseInvoiceResponseDto>> GetByVendorAsync(int vendorId);
    Task<PurchaseInvoiceResponseDto?> GetByIdAsync(int id);
    Task<PurchaseInvoiceResponseDto> CreateAsync(CreatePurchaseInvoiceDto dto);
}
