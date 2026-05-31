using Microsoft.AspNetCore.Mvc;
using VehicleParts.Application.DTOs;
using VehicleParts.Application.Interface.IServices;

namespace VehicleParts.API.Controllers;

// this controller handles login for all users (Admin, Staff)
// Route: POST /api/auth/login
[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    // login endpoint - the user sends their email and password and gets a JWT token back
    // default admin login: admin@autopartpro.com / Admin@123
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto dto)
    {
        // check if the request body has all required fields
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        // call the service to check the password and generate a token
        var result = await _authService.LoginAsync(dto);

        // if login failed (wrong email or password) return 401 Unauthorized
        if (result == null)
            return Unauthorized(new { message = "Invalid email or password." });

        // login was successful - return the token and user info
        return Ok(result);
    }

    // register endpoint - users send their details to create a new customer account
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        bool success = await _authService.RegisterAsync(dto);

        if (!success)
            return BadRequest(new { message = "Registration failed. Email might already be in use." });

        return Ok(new { message = "Registration successful! You can now log in." });
    }
}
