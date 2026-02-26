using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Data;
using TaskManager.Api.DTOs;
using TaskManager.Api.Entities;

namespace TaskManager.Api.Controllers;

/// <summary>Manages task CRUD operations for the authenticated user.</summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TasksController(AppDbContext db) : ControllerBase
{
    // ──────────────────────────────────────────────
    // Helpers
    // ──────────────────────────────────────────────

    /// <summary>Returns the caller's user ID from the JWT sub claim.</summary>
    private int GetCallerId() =>
        int.Parse(User.FindFirstValue(JwtRegisteredClaimNames.Sub)
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    private bool IsAdmin() => User.IsInRole("Admin");

    private static TaskResponse ToResponse(TaskItem t) =>
        new(t.Id, t.Title, t.Description, t.Status.ToString(), t.UserId);

    // ──────────────────────────────────────────────
    // GET /api/tasks
    // ──────────────────────────────────────────────

    /// <summary>Returns all tasks for the authenticated user. Admins see all tasks.</summary>
    [HttpGet]
    [ProducesResponseType<IEnumerable<TaskResponse>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var callerId = GetCallerId();
        var query = db.Tasks.AsNoTracking();

        if (!IsAdmin())
        {
            query = query.Where(t => t.UserId == callerId);
        }

        var tasks = await query.Select(t => ToResponse(t)).ToListAsync();
        return Ok(tasks);
    }

    // ──────────────────────────────────────────────
    // GET /api/tasks/{id}
    // ──────────────────────────────────────────────

    /// <summary>Returns a single task by ID. Users may only access their own tasks.</summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType<TaskResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        var task = await db.Tasks.AsNoTracking().FirstOrDefaultAsync(t => t.Id == id);

        if (task is null)
        {
            return NotFound();
        }

        if (!IsAdmin() && task.UserId != GetCallerId())
        {
            return Forbid();
        }

        return Ok(ToResponse(task));
    }

    // ──────────────────────────────────────────────
    // POST /api/tasks
    // ──────────────────────────────────────────────

    /// <summary>Creates a new task associated with the authenticated user.</summary>
    [HttpPost]
    [ProducesResponseType<TaskResponse>(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateTaskRequest request)
    {
        if (!Enum.TryParse<TaskItemStatus>(request.Status, ignoreCase: true, out var status))
        {
            return BadRequest(new { error = $"Invalid status '{request.Status}'. Valid values: Pending, InProgress, Completed." });
        }

        var task = new TaskItem
        {
            Title = request.Title,
            Description = request.Description ?? string.Empty,
            Status = status,
            UserId = GetCallerId()
        };

        db.Tasks.Add(task);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = task.Id }, ToResponse(task));
    }

    // ──────────────────────────────────────────────
    // PUT /api/tasks/{id}
    // ──────────────────────────────────────────────

    /// <summary>Updates an existing task. Users may only update their own tasks.</summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType<TaskResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateTaskRequest request)
    {
        var task = await db.Tasks.FirstOrDefaultAsync(t => t.Id == id);

        if (task is null)
        {
            return NotFound();
        }

        if (!IsAdmin() && task.UserId != GetCallerId())
        {
            return Forbid();
        }

        if (request.Title is not null) task.Title = request.Title;
        if (request.Description is not null) task.Description = request.Description;

        if (request.Status is not null)
        {
            if (!Enum.TryParse<TaskItemStatus>(request.Status, ignoreCase: true, out var updatedStatus))
            {
                return BadRequest(new { error = $"Invalid status '{request.Status}'. Valid values: Pending, InProgress, Completed." });
            }
            task.Status = updatedStatus;
        }

        await db.SaveChangesAsync();
        return Ok(ToResponse(task));
    }

    // ──────────────────────────────────────────────
    // DELETE /api/tasks/{id}
    // ──────────────────────────────────────────────

    /// <summary>Deletes a task. Users may only delete their own tasks.</summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        var task = await db.Tasks.FirstOrDefaultAsync(t => t.Id == id);

        if (task is null)
        {
            return NotFound();
        }

        if (!IsAdmin() && task.UserId != GetCallerId())
        {
            return Forbid();
        }

        db.Tasks.Remove(task);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
