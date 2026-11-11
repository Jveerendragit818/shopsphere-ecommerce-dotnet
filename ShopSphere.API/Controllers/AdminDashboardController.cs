using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShopSphere.Core.Interfaces;

namespace ShopSphere.API.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/admin/dashboard")]
public sealed class AdminDashboardController : ControllerBase
{
    private readonly IAdminDashboardService _dashboardService;

    public AdminDashboardController(
        IAdminDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var summary = await _dashboardService.GetSummaryAsync();
        return Ok(summary);
    }
    [HttpGet("charts")]
    public async Task<IActionResult> GetCharts(
    [FromQuery] DateTime? fromDate,
    [FromQuery] DateTime? toDate,
    [FromQuery] int? categoryId)
    {
        if (fromDate.HasValue && toDate.HasValue && fromDate > toDate)
            return BadRequest(new
            {
                message = "From date must be before or equal to date."
            });

        if (categoryId is <= 0)
            return BadRequest(new
            {
                message = "Category ID must be positive."
            });

        var charts = await _dashboardService.GetChartsAsync(
            fromDate, toDate, categoryId);

        return Ok(charts);
    }
}