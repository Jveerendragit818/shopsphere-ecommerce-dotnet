using Microsoft.AspNetCore.Authentication.Cookies;
using MySql.Data.MySqlClient;
using ShopSphere.API.Services;
using ShopSphere.Core.Interfaces;
using ShopSphere.Data.Database;
using ShopSphere.Data.Repositories;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

var connectionString = builder.Configuration.GetConnectionString("ShopSphereDB")
    ?? throw new InvalidOperationException(
        "Connection string 'ShopSphereDB' was not found.");

builder.Services.AddSingleton(new MySqlConnectionFactory(connectionString));

builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<ICustomerRepository, CustomerRepository>();
builder.Services.AddScoped<ICartRepository, CartRepository>();
builder.Services.AddScoped<IWishlistRepository, WishlistRepository>();
builder.Services.AddScoped<IOrderRepository, OrderRepository>();
builder.Services.AddScoped<IReviewRepository, ReviewRepository>();
builder.Services.AddScoped<IInventoryRepository, InventoryRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IPaymentRepository, PaymentRepository>();
builder.Services.AddScoped<INotificationRepository, NotificationRepository>();
builder.Services.AddScoped<IAuditLogRepository, AuditLogRepository>();
builder.Services.AddScoped<IAddressRepository, AddressRepository>();
builder.Services.AddScoped<IPasswordHashingService, PasswordHashingService>();
builder.Services.AddScoped<IAuthenticationService, AuthenticationService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<IInventoryService, InventoryService>();
builder.Services.AddScoped<IProductImageRepository, ProductImageRepository>();
builder.Services.AddScoped<IProductImageService, ProductImageService>();

builder.Services
    .AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.Cookie.Name = "ShopSphere.Auth";
        options.Cookie.HttpOnly = true;
        options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
        options.Cookie.SameSite = SameSiteMode.Lax;
        options.ExpireTimeSpan = TimeSpan.FromMinutes(30);
        options.SlidingExpiration = true;
    });

builder.Services.AddAuthorization();
builder.Services.AddScoped<ICartService, CartService>();
builder.Services.AddScoped<IWishlistService, WishlistService>();
builder.Services.AddScoped<IOrderService, OrderService>();

var app = builder.Build();

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapGet("/health", () => Results.Ok(new
{
    project = "ShopSphere",
    phase = 1,
    status = "Running",
    database = "MySQL"
}));

app.MapGet("/health/database", async (
    MySqlConnectionFactory connectionFactory,
    ILogger<Program> logger) =>
{
    try
    {
        await using var connection =
            await connectionFactory.CreateOpenConnectionAsync();

        await using var command = new MySqlCommand("SELECT 1", connection);
        var result = await command.ExecuteScalarAsync();

        return result?.ToString() == "1"
            ? Results.Ok(new
            {
                status = "Connected",
                database = "ShopSphereDB"
            })
            : Results.StatusCode(StatusCodes.Status503ServiceUnavailable);
    }
    catch (Exception exception)
    {
        logger.LogError(exception, "MySQL connection check failed.");
        return Results.StatusCode(StatusCodes.Status503ServiceUnavailable);
    }
});

app.Run();