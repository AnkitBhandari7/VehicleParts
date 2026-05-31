using System.ComponentModel.DataAnnotations;

namespace VehicleParts.Application.DTOs;

public class RegisterCustomerDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(6, ErrorMessage = "Password must be at least 6 characters.")]
    public string Password { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string LastName { get; set; } = string.Empty;

    [Required]
    [Phone]
    public string Phone { get; set; } = string.Empty;

    [Required]
    public string Address { get; set; } = string.Empty;

    [Required]
    public DateTime DateOfBirth { get; set; }
}

public class CustomerResponseDto
{
    public int CustomerID { get; set; }
    public int UserID { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
    public decimal TotalSpent { get; set; }
    public int LoyaltyPoints { get; set; }
    public decimal CreditBalance { get; set; }
    public string CreditStatus { get; set; } = string.Empty;
    public int TotalVisits { get; set; }
    public DateTime RegisteredAt { get; set; }
    public List<VehicleResponseDto> Vehicles { get; set; } = new();
}

public class AddVehicleDto
{
    [Required]
    public string VehicleNumber { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string Make { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string Model { get; set; } = string.Empty;

    [Required]
    [StringLength(4)]
    public string Year { get; set; } = string.Empty;

    [StringLength(50)]
    public string Color { get; set; } = string.Empty;

    public string Notes { get; set; } = string.Empty;

    [StringLength(17, ErrorMessage = "VIN must be at most 17 characters.")]
    public string VIN { get; set; } = string.Empty;
}

public class VehicleResponseDto
{
    public int VehicleID { get; set; }
    public int CustomerID { get; set; }
    public string VehicleNumber { get; set; } = string.Empty;
    public string Make { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public string Year { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
    public string VIN { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public enum CustomerSearchType
{
    Name = 0,
    PhoneNumber = 1,
    CustomerId = 2,
    VehiclePlateNumber = 3
}

public class CustomerSearchResultDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public List<string> VehiclePlateNumbers { get; set; } = new();
}

public class UpdateCustomerDto
{
    [Required]
    [StringLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string LastName { get; set; } = string.Empty;

    [Required]
    [Phone]
    public string Phone { get; set; } = string.Empty;

    [Required]
    public string Address { get; set; } = string.Empty;

    [Required]
    public DateTime DateOfBirth { get; set; }
}