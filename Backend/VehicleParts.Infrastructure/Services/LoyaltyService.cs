using VehicleParts.Application.DTOs;
using VehicleParts.Application.Interface.IRepository;
using VehicleParts.Application.Interface.IServices;

namespace VehicleParts.Infrastructure.Services;

public class LoyaltyService : ILoyaltyService
{
    private readonly ILoyaltyRepository _loyaltyRepository;

    // Loyalty discount constants
    private const decimal LoyaltyDiscountThreshold = 5000m;
    private const decimal LoyaltyDiscountPercent = 10m;

    public LoyaltyService(ILoyaltyRepository loyaltyRepository)
    {
        _loyaltyRepository = loyaltyRepository;
    }

    /// <summary>
    /// Gets full loyalty summary for a customer including
    /// all their loyalty transactions and current points.
    /// </summary>
    public async Task<CustomerLoyaltySummaryDto?> GetLoyaltySummaryAsync(int customerId)
    {
        var customer = await _loyaltyRepository.GetCustomerByIdAsync(customerId);
        if (customer == null) return null;

        var transactions = await _loyaltyRepository.GetTransactionsByCustomerIdAsync(customerId);

        return new CustomerLoyaltySummaryDto
        {
            CustomerID = customer.CustomerID,
            CustomerName = $"{customer.FirstName} {customer.LastName}",
            TotalSpent = customer.TotalSpent,
            LoyaltyPoints = customer.LoyaltyPoints,
            CreditStatus = customer.CreditStatus,
            Transactions = transactions.Select(t => new LoyaltyTransactionDto
            {
                ID = t.ID,
                CustomerID = t.CustomerID,
                CustomerName = $"{t.CustomerDetail.FirstName} {t.CustomerDetail.LastName}",
                InvoiceID = t.InvoiceID,
                PointsEarned = t.PointsEarned,
                PointsUsed = t.PointsUsed,
                Reason = t.Reason,
                CreatedAt = t.CreatedAt
            }).ToList()
        };
    }

    /// <summary>
    /// Checks if a given subtotal is eligible for
    /// the 10% loyalty discount (subtotal must exceed 5000).
    /// </summary>
    public async Task<LoyaltyDiscountCheckDto> CheckDiscountEligibilityAsync(
        int customerId, decimal subTotal)
    {
        var customer = await _loyaltyRepository.GetCustomerByIdAsync(customerId);
        if (customer == null)
            throw new Exception($"Customer with ID {customerId} not found.");

        bool isEligible = subTotal > LoyaltyDiscountThreshold;
        decimal discountAmount = isEligible ? subTotal * (LoyaltyDiscountPercent / 100) : 0;
        decimal finalAmount = subTotal - discountAmount;

        return new LoyaltyDiscountCheckDto
        {
            CustomerID = customer.CustomerID,
            CustomerName = $"{customer.FirstName} {customer.LastName}",
            SubTotal = subTotal,
            IsEligibleForDiscount = isEligible,
            DiscountPercent = isEligible ? LoyaltyDiscountPercent : 0,
            DiscountAmount = discountAmount,
            FinalAmount = finalAmount,
            Message = isEligible
                ? $"Congratulations! You qualify for a 10% loyalty discount. You save {discountAmount:F2}!"
                : $"Spend more than {LoyaltyDiscountThreshold} to get a 10% loyalty discount. Current subtotal: {subTotal:F2}."
        };
    }
}