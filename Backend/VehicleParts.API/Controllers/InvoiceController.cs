using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VehicleParts.Application.DTOs;
using VehicleParts.Application.Interface.IServices;

namespace VehicleParts.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class InvoiceController : ControllerBase
{
    private readonly IInvoiceService _invoiceService;

    public InvoiceController(IInvoiceService invoiceService)
    {
        _invoiceService = invoiceService;
    }

    /// <summary>
    /// POST: api/invoice
    /// Staff creates a sale invoice for a customer.
    /// Automatically applies 10% discount if subtotal exceeds 5000.
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> CreateInvoice([FromBody] CreateInvoiceRequestDto request)
    {
        try
        {
            // Auto-assign the invoice to the logged-in staff member
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (!string.IsNullOrEmpty(userIdClaim) && int.TryParse(userIdClaim, out int loggedInUserId))
            {
                request.StaffID = loggedInUserId;
            }

            var result = await _invoiceService.CreateSaleInvoiceAsync(request);
            return CreatedAtAction(nameof(GetInvoiceById), new { invoiceId = result.InvoiceID }, result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// GET: api/invoice/{invoiceId}
    /// Gets a single invoice by ID.
    /// </summary>
    [HttpGet("{invoiceId}")]
    [Authorize(Roles = "Admin,Staff,Customer")]
    public async Task<IActionResult> GetInvoiceById(int invoiceId)
    {
        try
        {
            var result = await _invoiceService.GetInvoiceByIdAsync(invoiceId);
            if (result == null)
                return NotFound(new { message = $"Invoice with ID {invoiceId} not found." });

            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// GET: api/invoice/customer/{customerId}
    /// Gets all invoices for a specific customer.
    /// </summary>
    [HttpGet("customer/{customerId}")]
    [Authorize(Roles = "Admin,Staff,Customer")]
    public async Task<IActionResult> GetInvoicesByCustomer(int customerId)
    {
        try
        {
            var result = await _invoiceService.GetInvoicesByCustomerIdAsync(customerId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// POST: api/invoice/send
    /// Staff sends an invoice via email to the customer.
    /// Uses Mailtrap sandbox SMTP for safe testing.
    /// Body: { "invoiceID": 1, "subject": "Your Invoice", "description": "Thanks for your purchase" }
    /// </summary>
    [HttpPost("send")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> SendEmail([FromBody] SendInvoiceEmailDto request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var result = await _invoiceService.SendInvoiceByEmailAsync(request);
            if (result.Success)
                return Ok(result);

            return StatusCode(500, result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}