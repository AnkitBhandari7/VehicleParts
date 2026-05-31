using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VehicleParts.Application.DTOs;
using VehicleParts.Application.Interface.IServices;

namespace VehicleParts.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CustomerController : ControllerBase
{
    private readonly ICustomerService _customerService;

    public CustomerController(ICustomerService customerService)
    {
        _customerService = customerService;
    }

    /// <summary>GET /api/customer — returns all registered customers (Staff/Admin).</summary>
    [Authorize(Roles = "Admin,Staff")]
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var customers = await _customerService.GetAllCustomersAsync();
        return Ok(customers);
    }

    /// <summary>GET /api/customer/{id} — returns a customer with their vehicles (Staff/Admin).</summary>
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var customer = await _customerService.GetCustomerByIdAsync(id);

        if (customer is null)
            return NotFound(new { message = $"Customer with ID {id} was not found." });

        return Ok(customer);
    }

    /// <summary>
    /// POST /api/customer/register — staff registers a new customer.
    /// Creates a User account (Role = Customer) and a CustomerDetail record.
    /// </summary>
    [Authorize(Roles = "Staff")]
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterCustomerDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var customer = await _customerService.RegisterCustomerAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = customer.CustomerID }, customer);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    /// <summary>
    /// POST /api/customer/{customerId}/vehicles — adds a vehicle to an existing customer (Staff/Admin).
    /// </summary>
    [HttpPost("{customerId:int}/vehicles")]
    public async Task<IActionResult> AddVehicle(int customerId, [FromBody] AddVehicleDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var vehicle = await _customerService.AddVehicleAsync(customerId, dto);
            return CreatedAtAction(
                nameof(GetVehiclesByCustomer),
                new { customerId },
                vehicle);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>GET /api/customer/{customerId}/vehicles — returns all vehicles owned by a customer.</summary>
    [HttpGet("{customerId:int}/vehicles")]
    public async Task<IActionResult> GetVehiclesByCustomer(int customerId)
    {
        var vehicles = await _customerService.GetVehiclesByCustomerAsync(customerId);
        return Ok(vehicles);
    }

    /// <summary>GET /api/customer/search — search customers by name, phone, ID, or plate number.</summary>
    [Authorize(Roles = "Admin,Staff")]
    [HttpGet("search")]
    public async Task<ActionResult<List<CustomerSearchResultDto>>> Search([FromQuery] CustomerSearchType type, [FromQuery] string? query, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return Ok(new List<CustomerSearchResultDto>());
        }

        var result = await _customerService.SearchCustomersAsync(type, query, ct);
        return Ok(result);
    }

    /// <summary>PUT /api/customer/{id} — updates customer profile details.</summary>
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateCustomerDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var result = await _customerService.UpdateCustomerAsync(id, dto);
            if (result == null)
                return NotFound(new { message = $"Customer with ID {id} was not found." });

            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

