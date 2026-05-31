using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VehicleParts.Application.DTOs;
using VehicleParts.Application.Interface.IServices;

namespace VehicleParts.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class VendorController : ControllerBase
{
    private readonly IVendorService _vendorService;

    public VendorController(IVendorService vendorService)
    {
        _vendorService = vendorService;
    }

    /// <summary>GET /api/vendor — returns all vendors. Use ?activeOnly=true to filter only active ones.</summary>
    [HttpGet]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> GetAll([FromQuery] bool activeOnly = false)
    {
        var vendors = await _vendorService.GetAllVendorsAsync(activeOnly);
        return Ok(vendors);
    }

    /// <summary>GET /api/vendor/{id} — returns a single vendor by ID.</summary>
    [HttpGet("{id:int}")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> GetById(int id)
    {
        var vendor = await _vendorService.GetVendorByIdAsync(id);

        if (vendor is null)
            return NotFound(new { message = $"Vendor with ID {id} was not found." });

        return Ok(vendor);
    }

    /// <summary>POST /api/vendor — creates a new vendor (Admin only).</summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateVendorDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var vendor = await _vendorService.CreateVendorAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = vendor.VendorID }, vendor);
    }

    /// <summary>PUT /api/vendor/{id} — updates an existing vendor (Admin only).</summary>
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateVendorDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var vendor = await _vendorService.UpdateVendorAsync(id, dto);

        if (vendor is null)
            return NotFound(new { message = $"Vendor with ID {id} was not found." });

        return Ok(vendor);
    }

    /// <summary>DELETE /api/vendor/{id} — soft-deletes (deactivates) a vendor (Admin only).</summary>
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Deactivate(int id)
    {
        var success = await _vendorService.DeactivateVendorAsync(id);

        if (!success)
            return NotFound(new { message = $"Vendor with ID {id} was not found." });

        return Ok(new { message = "Vendor has been deactivated successfully." });
    }
}
