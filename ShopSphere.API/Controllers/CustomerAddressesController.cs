using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShopSphere.Core.DTOs;
using ShopSphere.Core.Interfaces;

namespace ShopSphere.API.Controllers;

[ApiController]
[Authorize(Roles = "Customer")]
[Route("api/account/addresses")]
public sealed class CustomerAddressesController : ControllerBase
{
    private readonly IAddressService _addressService;
    private readonly ICustomerRepository _customerRepository;

    public CustomerAddressesController(
        IAddressService addressService,
        ICustomerRepository customerRepository)
    {
        _addressService = addressService;
        _customerRepository = customerRepository;
    }

    [HttpGet]
    public async Task<IActionResult> GetAddresses()
    {
        var customerId = await GetCustomerIdAsync();
        if (customerId is null)
            return NotFound(new { message = "Customer account was not found." });

        return Ok(await _addressService.GetByCustomerIdAsync(customerId.Value));
    }

    [HttpPost]
    public async Task<IActionResult> AddAddress(AddressRequestDto request)
    {
        var customerId = await GetCustomerIdAsync();
        if (customerId is null)
            return NotFound(new { message = "Customer account was not found." });

        var addressId = await _addressService.AddAsync(
            customerId.Value, request);

        return Created(
            "/api/account/addresses",
            new { addressId });
    }

    [HttpPut("{addressId:int}")]
    public async Task<IActionResult> UpdateAddress(
        int addressId,
        AddressRequestDto request)
    {
        var customerId = await GetCustomerIdAsync();
        if (customerId is null)
            return NotFound(new { message = "Customer account was not found." });

        var updated = await _addressService.UpdateAsync(
            customerId.Value, addressId, request);

        return updated ? NoContent() : NotFound();
    }

    [HttpDelete("{addressId:int}")]
    public async Task<IActionResult> DeleteAddress(int addressId)
    {
        var customerId = await GetCustomerIdAsync();
        if (customerId is null)
            return NotFound(new { message = "Customer account was not found." });

        var deleted = await _addressService.DeleteAsync(
            customerId.Value, addressId);

        return deleted ? NoContent() : NotFound();
    }

    [HttpPut("{addressId:int}/default")]
    public async Task<IActionResult> SetDefault(int addressId)
    {
        var customerId = await GetCustomerIdAsync();
        if (customerId is null)
            return NotFound(new { message = "Customer account was not found." });

        var updated = await _addressService.SetDefaultAsync(
            customerId.Value, addressId);

        return updated ? NoContent() : NotFound();
    }

    private async Task<int?> GetCustomerIdAsync()
    {
        var userIdText = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(userIdText, out var userId))
            return null;

        var customer = await _customerRepository.GetByUserIdAsync(userId);
        return customer?.CustomerId;
    }
}