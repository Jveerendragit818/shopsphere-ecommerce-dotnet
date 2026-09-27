using Microsoft.AspNetCore.Mvc;

namespace ShopSphere.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StatusController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new
        {
            project = "ShopSphere",
            phase = 1,
            status = "Running",
            database = "MySQL",
            dataAccess = "ADO.NET"
        });
    }
}