using VehicleParts.Application.DTOs;
using VehicleParts.Domain.Models;

namespace VehicleParts.Application.Interface.IServices;

public interface IAppointmentService
{
    Task<Appointment> BookAppointmentAsync(CreateAppointmentDto dto);
    Task<IEnumerable<Appointment>> GetAppointmentsByCustomerIdAsync(int customerId);
    Task<Appointment?> GetAppointmentByIdAsync(int id);
    Task<IEnumerable<Appointment>> GetAllAppointmentsAsync();
    Task<Appointment?> UpdateAppointmentStatusAsync(int id, string status);
}