using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VehicleParts.Application.DTOs;
using VehicleParts.Application.Interface.IServices;

namespace VehicleParts.API.Controllers.Admin;

// Feature 3: this controller handles all parts inventory management actions
// only Admin users are allowed to use these endpoints
// Route: /api/admin/parts
[ApiController]
[Route("api/admin/parts")]
[Authorize(Roles = "Admin,Staff")]
public class PartsController : ControllerBase
{
    private readonly IPartService _partService;

    public PartsController(IPartService partService)
    {
        _partService = partService;
    }

    // GET /api/admin/parts - get all active parts
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _partService.GetAllPartsAsync();
        return Ok(result);
    }

    // GET /api/admin/parts/search?keyword=brake - search parts by name or category
    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string keyword)
    {
        if (string.IsNullOrWhiteSpace(keyword))
            return BadRequest(new { message = "Keyword is required for search." });

        var result = await _partService.SearchPartsAsync(keyword);
        return Ok(result);
    }

    // GET /api/admin/parts/{id} - get one specific part by ID
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _partService.GetPartByIdAsync(id);
        if (result == null)
            return NotFound(new { message = "Part not found." });
        return Ok(result);
    }

    // POST /api/admin/parts - add a new part to the inventory
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreatePartDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _partService.CreatePartAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.PartID }, result);
    }

    // PUT /api/admin/parts/{id} - update a part's details
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdatePartDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _partService.UpdatePartAsync(id, dto);
        if (result == null)
            return NotFound(new { message = "Part not found." });
        return Ok(result);
    }

    // DELETE /api/admin/parts/{id} - remove a part from the inventory
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _partService.DeletePartAsync(id);
        if (!success)
            return NotFound(new { message = "Part not found." });
        return Ok(new { message = "Part deleted successfully." });
    }

    // POST /api/admin/parts/{id}/stock-in - add more stock to an existing part
    [HttpPost("{id:int}/stock-in")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> StockIn(int id, [FromBody] StockInDto dto)
    {
        if (dto.Quantity <= 0)
            return BadRequest(new { message = "Quantity must be greater than zero." });

        var result = await _partService.StockInAsync(id, dto);
        if (result == null)
            return NotFound(new { message = "Part not found." });
        return Ok(result);
    }
}
