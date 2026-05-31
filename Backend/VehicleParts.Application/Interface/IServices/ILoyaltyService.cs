using VehicleParts.Application.DTOs;

namespace VehicleParts.Application.Interface.IServices;

public interface ILoyaltyService
{
    Task<CustomerLoyaltySummaryDto?> GetLoyaltySummaryAsync(int customerId);
    Task<LoyaltyDiscountCheckDto> CheckDiscountEligibilityAsync(int customerId, decimal subTotal);
}