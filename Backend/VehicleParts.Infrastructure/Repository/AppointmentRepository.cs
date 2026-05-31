using Microsoft.EntityFrameworkCore;
using VehicleParts.Application.Interface.IRepository;
using VehicleParts.Domain.Models;
using VehicleParts.Infrastructure.Persistance;

namespace VehicleParts.Infrastructure.Repository;

public class AppointmentRepository : IAppointmentRepository
{
    private readonly AppDbContext _context;

    public AppointmentRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Appointment> CreateAppointmentAsync(Appointment appointment)
    {
        _context.Appointments.Add(appointment);
        await _context.SaveChangesAsync();
        return appointment;
    }

    public async Task<IEnumerable<Appointment>> GetAppointmentsByCustomerIdAsync(int customerId)
    {
        return await _context.Appointments
            .Where(a => a.CustomerID == customerId)
            .ToListAsync();
    }

    public async Task<Appointment?> GetAppointmentByIdAsync(int id)
    {
        return await _context.Appointments
            .Include(a => a.CustomerDetail)
            .Include(a => a.Vehicle)
            .FirstOrDefaultAsync(a => a.AppointmentID == id);
    }

    public async Task<IEnumerable<Appointment>> GetAllAppointmentsAsync()
    {
        return await _context.Appointments
            .Include(a => a.CustomerDetail)
            .Include(a => a.Vehicle)
            .OrderByDescending(a => a.AppointmentDate)
            .ToListAsync();
    }

    public async Task<Appointment?> UpdateAppointmentAsync(Appointment appointment)
    {
        _context.Appointments.Update(appointment);
        await _context.SaveChangesAsync();
        return appointment;
    }
}