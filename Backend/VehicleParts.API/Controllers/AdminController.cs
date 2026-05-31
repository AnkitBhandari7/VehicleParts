using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace VehicleParts.API.Controllers;

// General admin controller — staff management has moved to Controllers/Admin/StaffController.cs (Feature F2)
// to avoid AmbiguousMatchException on /api/admin/staff routes.
[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Administrator,Admin")]
public class AdminController : ControllerBase
{
    // Future admin-wide endpoints can be added here.
    // Staff endpoints: see Controllers/Admin/StaffController.cs
}
