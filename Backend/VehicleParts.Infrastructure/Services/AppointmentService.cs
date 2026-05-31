using VehicleParts.Application.DTOs;
using VehicleParts.Application.Interface.IRepository;
using VehicleParts.Application.Interface.IServices;
using VehicleParts.Domain.Models;

namespace VehicleParts.Infrastructure.Services;

public class AppointmentService : IAppointmentService
{
    private readonly IAppointmentRepository _appointmentRepository;

    public AppointmentService(IAppointmentRepository appointmentRepository)
    {
        _appointmentRepository = appointmentRepository;
    }

    public async Task<Appointment> BookAppointmentAsync(CreateAppointmentDto dto)
    {
        var appointment = new Appointment
        {
            CustomerID = dto.CustomerId,
            VehicleID = dto.VehicleId,
            StaffID = dto.StaffId,
            AppointmentDate = DateTime.SpecifyKind(dto.AppointmentDate, DateTimeKind.Utc),  // ← force UTC
            TimeSlot = dto.TimeSlot,
            ServiceDescription = dto.ServiceDescription,
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        };

        return await _appointmentRepository.CreateAppointmentAsync(appointment);
    }

    public async Task<IEnumerable<Appointment>> GetAppointmentsByCustomerIdAsync(int customerId)
    {
        return await _appointmentRepository.GetAppointmentsByCustomerIdAsync(customerId);
    }

    public async Task<Appointment?> GetAppointmentByIdAsync(int id)
    {
        return await _appointmentRepository.GetAppointmentByIdAsync(id);
    }

    public async Task<IEnumerable<Appointment>> GetAllAppointmentsAsync()
    {
        return await _appointmentRepository.GetAllAppointmentsAsync();
    }

    public async Task<Appointment?> UpdateAppointmentStatusAsync(int id, string status)
    {
        var app = await _appointmentRepository.GetAppointmentByIdAsync(id);
        if (app == null) return null;
        app.Status = status;
        return await _appointmentRepository.UpdateAppointmentAsync(app);
    }
}