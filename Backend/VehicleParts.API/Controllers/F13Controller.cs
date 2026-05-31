using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VehicleParts.Application.DTOs;
using VehicleParts.Application.Interface.IServices;

namespace VehicleParts.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Staff,Customer")]
public class F13Controller : ControllerBase
{
    private readonly IAppointmentService _appointmentService;
    private readonly IPartRequestService _partRequestService;
    private readonly IServiceReviewService _serviceReviewService;

    public F13Controller(
        IAppointmentService appointmentService,
        IPartRequestService partRequestService,
        IServiceReviewService serviceReviewService)
    {
        _appointmentService = appointmentService;
        _partRequestService = partRequestService;
        _serviceReviewService = serviceReviewService;
    }

    // Book Appointment
    [HttpPost("appointments")]
    public async Task<IActionResult> BookAppointment([FromBody] CreateAppointmentDto dto)
    {
        var result = await _appointmentService.BookAppointmentAsync(dto);
        return Ok(result);
    }

    // Get All Appointments (for Staff / Admin)
    [HttpGet("appointments/all")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> GetAllAppointments()
    {
        var appointments = await _appointmentService.GetAllAppointmentsAsync();
        var result = appointments.Select(a => new
        {
            a.AppointmentID,
            a.CustomerID,
            CustomerName = $"{a.CustomerDetail.FirstName} {a.CustomerDetail.LastName}",
            a.VehicleID,
            VehicleMake = a.Vehicle.Make,
            VehicleModel = a.Vehicle.Model,
            VehiclePlate = a.Vehicle.VehicleNumber,
            a.AppointmentDate,
            a.TimeSlot,
            a.ServiceDescription,
            a.Status,
            a.CreatedAt
        });
        return Ok(result);
    }

    // Update Appointment Status (for Staff / Admin)
    [HttpPut("appointments/{id:int}/status")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> UpdateAppointmentStatus(int id, [FromBody] UpdateAppointmentStatusDto dto)
    {
        var result = await _appointmentService.UpdateAppointmentStatusAsync(id, dto.Status);
        if (result == null)
            return NotFound(new { message = "Appointment not found." });
        return Ok(result);
    }

    // Get Appointments by Customer
    [HttpGet("appointments/{customerId:int}")]
    public async Task<IActionResult> GetAppointments(int customerId)
    {
        var result = await _appointmentService.GetAppointmentsByCustomerIdAsync(customerId);
        return Ok(result);
    }

    // Request Unavailable Part
    [HttpPost("part-requests")]
    public async Task<IActionResult> RequestPart([FromBody] CreatePartRequestDto dto)
    {
        var result = await _partRequestService.CreatePartRequestAsync(dto);
        return Ok(result);
    }

    // Get Part Requests by Customer
    [HttpGet("part-requests/{customerId}")]
    public async Task<IActionResult> GetPartRequests(int customerId)
    {
        var result = await _partRequestService.GetPartRequestsByCustomerIdAsync(customerId);
        return Ok(result);
    }

    // Submit Service Review
    [HttpPost("reviews")]
    public async Task<IActionResult> SubmitReview([FromBody] CreateServiceReviewDto dto)
    {
        var result = await _serviceReviewService.SubmitReviewAsync(dto);
        return Ok(result);
    }

    // Get Reviews by Customer
    [HttpGet("reviews/{customerId}")]
    public async Task<IActionResult> GetReviews(int customerId)
    {
        var result = await _serviceReviewService.GetReviewsByCustomerIdAsync(customerId);
        return Ok(result);
    }
}