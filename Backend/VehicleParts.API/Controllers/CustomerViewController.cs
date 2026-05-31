namespace VehicleParts.API.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VehicleParts.Application.Interface.IServices;

[ApiController]
[Route("api/customer-view")]
[Authorize(Roles = "Admin,Staff,Customer")]
public class CustomerViewController : ControllerBase
{
    private readonly ICustomerViewService _service;

    public CustomerViewController(ICustomerViewService service)
    {
        _service = service;
    }

    [HttpGet("{customerId}")]
    public async Task<IActionResult> GetCustomerDetails(int customerId)
    {
        var customer = await _service.GetCustomerByIdAsync(customerId);
        if (customer == null) return NotFound("Customer not found.");
        return Ok(customer);
    }

    [HttpGet("{customerId}/vehicles")]
    public async Task<IActionResult> GetCustomerVehicles(int customerId)
    {
        var vehicles = await _service.GetCustomerVehiclesAsync(customerId);
        return Ok(vehicles);
    }

    [HttpGet("{customerId}/history")]
    public async Task<IActionResult> GetCustomerPurchaseHistory(int customerId)
    {
        var history = await _service.GetCustomerPurchaseHistoryAsync(customerId);
        return Ok(history);
    }
}