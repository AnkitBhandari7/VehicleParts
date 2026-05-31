using VehicleParts.Domain.Models;

namespace VehicleParts.Application.Interface.IRepository;

public interface IAppointmentRepository
{
    Task<Appointment> CreateAppointmentAsync(Appointment appointment);
    Task<IEnumerable<Appointment>> GetAppointmentsByCustomerIdAsync(int customerId);
    Task<Appointment?> GetAppointmentByIdAsync(int id);
    Task<IEnumerable<Appointment>> GetAllAppointmentsAsync();
    Task<Appointment?> UpdateAppointmentAsync(Appointment appointment);
}