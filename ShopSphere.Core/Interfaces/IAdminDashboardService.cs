using ShopSphere.Core.DTOs;

namespace ShopSphere.Core.Interfaces;

public interface IAdminDashboardService
{
    Task<AdminDashboardSummaryDto> GetSummaryAsync();
    Task<AdminDashboardChartsDto> GetChartsAsync(
    DateTime? fromDate,
    DateTime? toDate,
    int? categoryId);
}