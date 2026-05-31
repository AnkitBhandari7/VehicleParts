using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VehicleParts.Application.DTOs;
using VehicleParts.Application.Interface.IServices;

namespace VehicleParts.API.Controllers.Admin;

// Feature 2: this controller handles all staff management actions
// only Admin users are allowed to use these endpoints
// Route: /api/admin/staff
[ApiController]
[Route("api/admin/staff")]
[Authorize(Roles = "Admin")]
public class StaffController : ControllerBase
{
    private readonly IStaffService _staffService;

    public StaffController(IStaffService staffService)
    {
        _staffService = staffService;
    }

    // GET /api/admin/staff - get all staff members
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _staffService.GetAllStaffAsync();
        return Ok(result);
    }

    // GET /api/admin/staff/{id} - get one staff member by ID
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _staffService.GetStaffByIdAsync(id);
        if (result == null)
            return NotFound(new { message = "Staff member not found." });
        return Ok(result);
    }

    // POST /api/admin/staff - create a new staff member
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateStaffDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _staffService.CreateStaffAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.StaffID }, result);
    }

    // PUT /api/admin/staff/{id} - update a staff member's info
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateStaffDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _staffService.UpdateStaffAsync(id, dto);
        if (result == null)
            return NotFound(new { message = "Staff member not found." });
        return Ok(result);
    }

    // DELETE /api/admin/staff/{id} - remove a staff member
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _staffService.DeleteStaffAsync(id);
        if (!success)
            return NotFound(new { message = "Staff member not found." });
        return Ok(new { message = "Staff member deleted successfully." });
    }
}
