var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

var app = builder.Build();

app.UseHttpsRedirection();

app.MapControllers();

app.MapGet("/health", () => Results.Ok(new
{
    project = "ShopSphere",
    phase = 1,
    status = "Running",
    database = "MySQL"
}));

app.Run();