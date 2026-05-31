namespace VehicleParts.API.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VehicleParts.Application.Interface.IServices;

[ApiController]
[Route("api/customer-reports")]
[Authorize(Roles = "Admin,Staff")]
public class CustomerReportController : ControllerBase
{
    private readonly ICustomerReportService _service;

    public CustomerReportController(ICustomerReportService service)
    {
        _service = service;
    }

    [HttpGet("regulars")]
    public async Task<IActionResult> GetRegularCustomers([FromQuery] int topCount = 10)
    {
        var result = await _service.GetRegularCustomersAsync(topCount);
        return Ok(result);
    }

    [HttpGet("high-spenders")]
    public async Task<IActionResult> GetHighSpenders([FromQuery] int topCount = 10)
    {
        var result = await _service.GetHighSpendersAsync(topCount);
        return Ok(result);
    }

    [HttpGet("pending-credits")]
    public async Task<IActionResult> GetPendingCreditCustomers()
    {
        var result = await _service.GetPendingCreditCustomersAsync();
        return Ok(result);
    }
}