namespace VehicleParts.Application.DTOs;

// what the frontend sends when a user tries to login
public class LoginRequestDto
{
    public string Email    { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

// what we send back to the frontend after a successful login
public class LoginResponseDto
{
    public string Token      { get; set; } = string.Empty;
    public string Email      { get; set; } = string.Empty;
    public string FullName   { get; set; } = string.Empty;
    public string Role       { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    // Populated for Customer role users — needed to load appointments, reviews, etc.
    public int? CustomerId   { get; set; }
}

// what the frontend sends when a user creates an account
public class RegisterRequestDto
{
    public string FullName { get; set; } = string.Empty;
    public string Email    { get; set; } = string.Empty;
    public string Phone    { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
