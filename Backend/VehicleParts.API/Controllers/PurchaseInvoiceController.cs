using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VehicleParts.Application.DTOs;
using VehicleParts.Application.Interface.IServices;

namespace VehicleParts.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PurchaseInvoiceController : ControllerBase
{
    private readonly IPurchaseInvoiceService _purchaseInvoiceService;

    public PurchaseInvoiceController(IPurchaseInvoiceService purchaseInvoiceService)
    {
        _purchaseInvoiceService = purchaseInvoiceService;
    }

    /// <summary>GET /api/purchaseinvoice — returns all purchase invoices ordered by most recent.</summary>
    [HttpGet]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> GetAll()
    {
        var invoices = await _purchaseInvoiceService.GetAllAsync();
        return Ok(invoices);
    }

    /// <summary>GET /api/purchaseinvoice/{id} — returns a single purchase invoice.</summary>
    [HttpGet("{id:int}")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> GetById(int id)
    {
        var invoice = await _purchaseInvoiceService.GetByIdAsync(id);

        if (invoice is null)
            return NotFound(new { message = $"Purchase invoice with ID {id} was not found." });

        return Ok(invoice);
    }

    /// <summary>GET /api/purchaseinvoice/vendor/{vendorId} — all purchase invoices for a specific vendor.</summary>
    [HttpGet("vendor/{vendorId:int}")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> GetByVendor(int vendorId)
    {
        var invoices = await _purchaseInvoiceService.GetByVendorAsync(vendorId);
        return Ok(invoices);
    }

    /// <summary>
    /// POST /api/purchaseinvoice — creates a purchase invoice and automatically
    /// increments the stock of the purchased part (Admin only).
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreatePurchaseInvoiceDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var invoice = await _purchaseInvoiceService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = invoice.PurchaseInvoiceID }, invoice);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}
