namespace VehicleParts.Application.DTOs;

// what the frontend sends when admin creates a new staff member
public class CreateStaffDto
{
    public string Email     { get; set; } = string.Empty;
    public string Password  { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName  { get; set; } = string.Empty;
    public string Phone     { get; set; } = string.Empty;
    public string Address   { get; set; } = string.Empty;
    public string Position  { get; set; } = string.Empty;
    public DateTime HireDate { get; set; }
}

// what the frontend sends when admin edits an existing staff member
public class UpdateStaffDto
{
    public string? FirstName { get; set; }
    public string? LastName  { get; set; }
    public string? Phone     { get; set; }
    public string? Address   { get; set; }
    public string? Position  { get; set; }
    public string? Status    { get; set; }
}

// what we send back to the frontend after getting staff info
public class StaffResponseDto
{
    public int      StaffID   { get; set; }
    public int      UserID    { get; set; }
    public string   Email     { get; set; } = string.Empty;
    public string   FirstName { get; set; } = string.Empty;
    public string   LastName  { get; set; } = string.Empty;
    public string   Phone     { get; set; } = string.Empty;
    public string   Address   { get; set; } = string.Empty;
    public string   Position  { get; set; } = string.Empty;
    public string   Status    { get; set; } = string.Empty;
    public DateTime HireDate  { get; set; }
    public DateTime CreatedAt { get; set; }
}
