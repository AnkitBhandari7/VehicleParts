using VehicleParts.Domain.Models;

namespace VehicleParts.Application.Interface.IRepository;

public interface IPurchaseInvoiceRepository
{
    Task<IEnumerable<PurchaseInvoice>> GetAllAsync();
    Task<IEnumerable<PurchaseInvoice>> GetByVendorAsync(int vendorId);
    Task<PurchaseInvoice?> GetByIdAsync(int id);
    Task<PurchaseInvoice> CreateAsync(PurchaseInvoice purchaseInvoice);
}
