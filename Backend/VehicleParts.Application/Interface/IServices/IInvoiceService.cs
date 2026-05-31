using VehicleParts.Application.DTOs;

namespace VehicleParts.Application.Interface.IServices;

public interface IInvoiceService
{
    Task<InvoiceResponseDto> CreateSaleInvoiceAsync(CreateInvoiceRequestDto request);
    Task<InvoiceResponseDto?> GetInvoiceByIdAsync(int invoiceId);
    Task<IEnumerable<InvoiceResponseDto>> GetInvoicesByCustomerIdAsync(int customerId);

    // Feature 11 — Email invoice delivery
    Task<EmailResultDto> SendInvoiceByEmailAsync(SendInvoiceEmailDto request);
}