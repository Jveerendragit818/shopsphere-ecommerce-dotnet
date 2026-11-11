using ShopSphere.Core.DTOs;

namespace ShopSphere.Core.Interfaces;

public interface IAdminDashboardRepository
{
    Task<AdminDashboardSummaryDto> GetSummaryAsync();
    Task<AdminDashboardChartsDto> GetChartsAsync(
    DateTime? fromDate,
    DateTime? toDate,
    int? categoryId);
}