using ShopSphere.Core.DTOs;
using ShopSphere.Core.Interfaces;

namespace ShopSphere.API.Services;

public sealed class AdminDashboardService : IAdminDashboardService
{
    private readonly IAdminDashboardRepository _dashboardRepository;

    public AdminDashboardService(
        IAdminDashboardRepository dashboardRepository)
    {
        _dashboardRepository = dashboardRepository;
    }

    public Task<AdminDashboardSummaryDto> GetSummaryAsync()
    {
        return _dashboardRepository.GetSummaryAsync();
    }

    public Task<AdminDashboardChartsDto> GetChartsAsync(
    DateTime? fromDate,
    DateTime? toDate,
    int? categoryId)
    {
        return _dashboardRepository.GetChartsAsync(
            fromDate, toDate, categoryId);
    }
}