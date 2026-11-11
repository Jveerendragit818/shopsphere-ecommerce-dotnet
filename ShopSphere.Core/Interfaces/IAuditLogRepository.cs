using ShopSphere.Core.Entities;

namespace ShopSphere.Core.Interfaces;

public interface IAuditLogRepository
{
    Task<IReadOnlyList<AuditLog>> GetRecentAsync(int count);
    Task<int> AddAsync(AuditLog auditLog);
    Task<IReadOnlyList<AuditLog>> GetByEntityAsync(
    string entityName,
    string entityId,
    int count);
}