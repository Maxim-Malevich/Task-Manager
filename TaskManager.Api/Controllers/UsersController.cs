using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Data;
using TaskManager.Api.DTOs;

namespace TaskManager.Api.Controllers;

/// <summary>Admin-only user management endpoints.</summary>
[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class UsersController(AppDbContext db) : ControllerBase
{
    // ──────────────────────────────────────────────
    // GET /api/users  (admin only)
    // ──────────────────────────────────────────────

    /// <summary>Returns all users. Requires the Admin role.</summary>
    [HttpGet]
    [ProducesResponseType<IEnumerable<UserResponse>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetAll()
    {
        var users = await db.Users
            .AsNoTracking()
            .Select(u => new UserResponse(u.Id, u.Email, u.Role))
            .ToListAsync();

        return Ok(users);
    }
}
