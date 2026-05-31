using VehicleParts.Domain.Models;

namespace VehicleParts.Application.Interface.IRepository;

public interface IInvoiceRepository
{
    Task<Invoice> CreateInvoiceAsync(Invoice invoice);
    Task<Invoice?> GetInvoiceByIdAsync(int invoiceId);
    Task<IEnumerable<Invoice>> GetInvoicesByCustomerIdAsync(int customerId);
}