using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VehicleParts.Application.Interface.IServices;

namespace VehicleParts.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Staff,Customer")]
public class CustomerHistoryController : ControllerBase
{
    private readonly ICustomerHistoryService _customerHistoryService;

    public CustomerHistoryController(ICustomerHistoryService customerHistoryService)
    {
        _customerHistoryService = customerHistoryService;
    }

    /// <summary>
    /// GET: api/customerhistory/{customerId}
    /// Gets full history (purchases + services) for a customer.
    /// </summary>
    [HttpGet("{customerId}")]
    public async Task<IActionResult> GetFullHistory(int customerId)
    {
        try
        {
            var result = await _customerHistoryService.GetFullHistoryAsync(customerId);
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
    /// GET: api/customerhistory/{customerId}/purchases
    /// Gets only purchase history for a customer.
    /// </summary>
    [HttpGet("{customerId}/purchases")]
    public async Task<IActionResult> GetPurchaseHistory(int customerId)
    {
        try
        {
            var result = await _customerHistoryService.GetPurchaseHistoryAsync(customerId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// GET: api/customerhistory/{customerId}/services
    /// Gets only service history for a customer.
    /// </summary>
    [HttpGet("{customerId}/services")]
    public async Task<IActionResult> GetServiceHistory(int customerId)
    {
        try
        {
            var result = await _customerHistoryService.GetServiceHistoryAsync(customerId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}