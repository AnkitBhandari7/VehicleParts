using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VehicleParts.Application.Interface.IServices;

namespace VehicleParts.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Staff,Customer")]
public class LoyaltyController : ControllerBase
{
    private readonly ILoyaltyService _loyaltyService;

    public LoyaltyController(ILoyaltyService loyaltyService)
    {
        _loyaltyService = loyaltyService;
    }

    /// <summary>
    /// GET: api/loyalty/{customerId}
    /// Gets full loyalty summary for a customer
    /// including all transactions and current points.
    /// </summary>
    [HttpGet("{customerId}")]
    public async Task<IActionResult> GetLoyaltySummary(int customerId)
    {
        try
        {
            var result = await _loyaltyService.GetLoyaltySummaryAsync(customerId);
            if (result == null)
                return NotFound(new { message = $"Customer with ID {customerId} not found." });

            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// GET: api/loyalty/{customerId}/check-discount?subTotal=6000
    /// Checks if a subtotal qualifies for the 10% loyalty discount.
    /// </summary>
    [HttpGet("{customerId}/check-discount")]
    public async Task<IActionResult> CheckDiscountEligibility(
        int customerId, [FromQuery] decimal subTotal)
    {
        try
        {
            if (subTotal <= 0)
                return BadRequest(new { message = "SubTotal must be greater than 0." });

            var result = await _loyaltyService.CheckDiscountEligibilityAsync(customerId, subTotal);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}