using ShopSphere.Core.DTOs;
using ShopSphere.Core.Entities;
using ShopSphere.Core.Interfaces;

namespace ShopSphere.API.Services;

public sealed class AddressService : IAddressService
{
    private readonly IAddressRepository _addressRepository;

    public AddressService(IAddressRepository addressRepository)
    {
        _addressRepository = addressRepository;
    }

    public async Task<IReadOnlyList<Address>> GetByCustomerIdAsync(
        int customerId)
    {
        ValidateCustomerId(customerId);
        return await _addressRepository.GetByCustomerIdAsync(customerId);
    }

    public async Task<int> AddAsync(
        int customerId,
        AddressRequestDto request)
    {
        ValidateCustomerId(customerId);

        var addresses =
            await _addressRepository.GetByCustomerIdAsync(customerId);

        var address = CreateAddress(customerId, request);
        address.IsDefault = addresses.Count == 0;

        return await _addressRepository.AddAsync(address);
    }

    public async Task<bool> UpdateAsync(
        int customerId,
        int addressId,
        AddressRequestDto request)
    {
        ValidateCustomerId(customerId);
        ValidateAddressId(addressId);

        var address = await _addressRepository.GetByIdAsync(addressId);
        if (address is null || address.CustomerId != customerId)
            return false;

        address.FullName = request.FullName.Trim();
        address.Phone = request.Phone.Trim();
        address.AddressLine1 = request.AddressLine1.Trim();
        address.AddressLine2 = string.IsNullOrWhiteSpace(request.AddressLine2)
            ? null
            : request.AddressLine2.Trim();
        address.City = request.City.Trim();
        address.State = request.State.Trim();
        address.PostalCode = request.PostalCode.Trim();
        address.Country = request.Country.Trim();
        address.AddressType = request.AddressType;

        return await _addressRepository.UpdateAsync(address);
    }

    public async Task<bool> DeleteAsync(int customerId, int addressId)
    {
        ValidateCustomerId(customerId);
        ValidateAddressId(addressId);

        var address = await _addressRepository.GetByIdAsync(addressId);
        if (address is null || address.CustomerId != customerId)
            return false;

        var addresses =
            await _addressRepository.GetByCustomerIdAsync(customerId);

        if (!await _addressRepository.DeleteAsync(addressId))
            return false;

        if (address.IsDefault)
        {
            var nextDefault = addresses.FirstOrDefault(
                x => x.AddressId != addressId);

            if (nextDefault is not null)
                await _addressRepository.SetDefaultAsync(
                    customerId, nextDefault.AddressId);
        }

        return true;
    }

    public async Task<bool> SetDefaultAsync(int customerId, int addressId)
    {
        ValidateCustomerId(customerId);
        ValidateAddressId(addressId);

        var address = await _addressRepository.GetByIdAsync(addressId);
        if (address is null || address.CustomerId != customerId)
            return false;

        return await _addressRepository.SetDefaultAsync(customerId, addressId);
    }

    private static Address CreateAddress(
        int customerId,
        AddressRequestDto request)
    {
        return new Address
        {
            CustomerId = customerId,
            FullName = request.FullName.Trim(),
            Phone = request.Phone.Trim(),
            AddressLine1 = request.AddressLine1.Trim(),
            AddressLine2 = string.IsNullOrWhiteSpace(request.AddressLine2)
                ? null
                : request.AddressLine2.Trim(),
            City = request.City.Trim(),
            State = request.State.Trim(),
            PostalCode = request.PostalCode.Trim(),
            Country = request.Country.Trim(),
            AddressType = request.AddressType
        };
    }

    private static void ValidateCustomerId(int customerId)
    {
        if (customerId <= 0)
            throw new ArgumentOutOfRangeException(nameof(customerId));
    }

    private static void ValidateAddressId(int addressId)
    {
        if (addressId <= 0)
            throw new ArgumentOutOfRangeException(nameof(addressId));
    }
}