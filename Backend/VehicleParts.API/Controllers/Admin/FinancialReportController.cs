using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VehicleParts.Application.Interface.IServices;

namespace VehicleParts.API.Controllers.Admin;

// Feature 1: this controller lets admin generate and view financial reports
// only Admin users can access these endpoints
// Route: /api/admin/reports/financial
[ApiController]
[Route("api/admin/reports/financial")]
[Authorize(Roles = "Admin")]
public class FinancialReportController : ControllerBase
{
    private readonly IFinancialReportService _reportService;

    public FinancialReportController(IFinancialReportService reportService)
    {
        _reportService = reportService;
    }

    // GET /api/admin/reports/financial
    // returns the full financial report
    // optional query params: from and to dates
    // example: /api/admin/reports/financial?from=2026-01-01&to=2026-12-31
    [HttpGet]
    public async Task<IActionResult> GetFullReport(
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to)
    {
        var report = await _reportService.GetFinancialReportAsync(from, to);
        return Ok(report);
    }

    // GET /api/admin/reports/financial/monthly/{year}
    // returns month-by-month revenue for a specific year
    // example: /api/admin/reports/financial/monthly/2026
    [HttpGet("monthly/{year:int}")]
    public async Task<IActionResult> GetMonthlyRevenue(int year)
    {
        // make sure the year makes sense
        if (year < 2000 || year > DateTime.UtcNow.Year + 1)
            return BadRequest(new { message = "Please provide a valid year." });

        var result = await _reportService.GetMonthlyRevenueAsync(year);
        return Ok(result);
    }

    // GET /api/admin/reports/financial/top-parts
    // returns the top selling parts by revenue
    // optional query param: count (default 5)
    // example: /api/admin/reports/financial/top-parts?count=10
    [HttpGet("top-parts")]
    public async Task<IActionResult> GetTopParts([FromQuery] int count = 5)
    {
        // limit count between 1 and 20
        if (count < 1 || count > 20)
            return BadRequest(new { message = "Count must be between 1 and 20." });

        var result = await _reportService.GetTopPartsAsync(count);
        return Ok(result);
    }
}
