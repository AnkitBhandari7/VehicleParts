using VehicleParts.Domain.Models;

namespace VehicleParts.Application.Interface.IRepository;

// this is the contract for the Parts table in the database
// Feature 3: Admin manages vehicle parts inventory
public interface IPartRepository
{
    
    Task<IEnumerable<Part>> GetAllAsync();
    Task<Part?> GetByIdAsync(int partId);
    Task<Part?> GetByPartNumberAsync(string partNumber);
    Task<IEnumerable<Part>> SearchAsync(string keyword);
    Task<Part> AddAsync(Part part);
    Task UpdateAsync(Part part);
    Task DeleteAsync(Part part);
    Task AddStockTransactionAsync(StockTransaction transaction);
    Task SaveChangesAsync();
}
