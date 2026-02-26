using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManager.Api.Controllers;
using TaskManager.Api.Data;
using TaskManager.Api.DTOs;
using TaskManager.Api.Entities;
using Xunit;

namespace TaskManager.Api.Tests.Integration;

/// <summary>
/// Integration tests for <see cref="TasksController"/> using an in-memory
/// SQLite-compatible EF Core database.  Each test gets its own isolated DB
/// instance so tests are fully independent.
/// </summary>
public class TasksControllerTests
{
    // ── Helpers ───────────────────────────────────────────────────────────────

    /// <summary>Creates a fresh in-memory database for one test.</summary>
    private static AppDbContext CreateDb()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    /// <summary>
    /// Creates a <see cref="TasksController"/> whose <c>User</c> principal has
    /// the supplied <paramref name="userId"/> and <paramref name="role"/>.
    /// </summary>
    private static TasksController CreateController(
        AppDbContext db,
        int userId = 1,
        string role = "User")
    {
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new(ClaimTypes.Role, role),
        };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        var principal = new ClaimsPrincipal(identity);

        var controller = new TasksController(db)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = principal },
            },
        };
        return controller;
    }

    /// <summary>Seed two users and return their IDs.</summary>
    private static async Task<(int UserId1, int UserId2)> SeedUsersAsync(AppDbContext db)
    {
        var u1 = new User { Email = "alice@test.com", PasswordHash = "x", Role = "User" };
        var u2 = new User { Email = "bob@test.com",   PasswordHash = "x", Role = "User" };
        db.Users.AddRange(u1, u2);
        await db.SaveChangesAsync();
        return (u1.Id, u2.Id);
    }

    // ── GET /api/tasks ────────────────────────────────────────────────────────

    [Fact]
    public async Task GetAll_ReturnsOnlyOwnTasks_ForRegularUser()
    {
        using var db = CreateDb();
        var (uid1, uid2) = await SeedUsersAsync(db);

        db.Tasks.AddRange(
            new TaskItem { Title = "Alice Task", UserId = uid1, Status = TaskItemStatus.Pending },
            new TaskItem { Title = "Bob Task",   UserId = uid2, Status = TaskItemStatus.Pending });
        await db.SaveChangesAsync();

        var controller = CreateController(db, userId: uid1);
        var result = await controller.GetAll();

        var ok = Assert.IsType<OkObjectResult>(result);
        var tasks = Assert.IsAssignableFrom<IEnumerable<TaskResponse>>(ok.Value);
        Assert.Single(tasks);
        Assert.Equal("Alice Task", tasks.First().Title);
    }

    [Fact]
    public async Task GetAll_ReturnsAllTasks_ForAdmin()
    {
        using var db = CreateDb();
        var (uid1, uid2) = await SeedUsersAsync(db);

        db.Tasks.AddRange(
            new TaskItem { Title = "Alice Task", UserId = uid1, Status = TaskItemStatus.Pending },
            new TaskItem { Title = "Bob Task",   UserId = uid2, Status = TaskItemStatus.Completed });
        await db.SaveChangesAsync();

        var adminId = uid1; // admin just needs the Admin role
        var controller = CreateController(db, userId: adminId, role: "Admin");
        var result = await controller.GetAll();

        var ok = Assert.IsType<OkObjectResult>(result);
        var tasks = Assert.IsAssignableFrom<IEnumerable<TaskResponse>>(ok.Value);
        Assert.Equal(2, tasks.Count());
    }

    // ── GET /api/tasks/{id} ───────────────────────────────────────────────────

    [Fact]
    public async Task GetById_Returns200_WhenOwnerRequests()
    {
        using var db = CreateDb();
        var (uid1, _) = await SeedUsersAsync(db);

        var task = new TaskItem { Title = "My Task", UserId = uid1, Status = TaskItemStatus.Pending };
        db.Tasks.Add(task);
        await db.SaveChangesAsync();

        var controller = CreateController(db, userId: uid1);
        var result = await controller.GetById(task.Id);

        var ok = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<TaskResponse>(ok.Value);
        Assert.Equal("My Task", response.Title);
    }

    [Fact]
    public async Task GetById_Returns404_WhenTaskDoesNotExist()
    {
        using var db = CreateDb();
        await SeedUsersAsync(db);

        var controller = CreateController(db, userId: 1);
        var result = await controller.GetById(999);

        Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public async Task GetById_Returns403_WhenNonOwnerRequests()
    {
        using var db = CreateDb();
        var (uid1, uid2) = await SeedUsersAsync(db);

        var task = new TaskItem { Title = "Alice Task", UserId = uid1, Status = TaskItemStatus.Pending };
        db.Tasks.Add(task);
        await db.SaveChangesAsync();

        // Bob tries to read Alice's task
        var controller = CreateController(db, userId: uid2);
        var result = await controller.GetById(task.Id);

        Assert.IsType<ForbidResult>(result);
    }

    // ── POST /api/tasks ───────────────────────────────────────────────────────

    [Fact]
    public async Task Create_Returns201_WithValidRequest()
    {
        using var db = CreateDb();
        var (uid1, _) = await SeedUsersAsync(db);

        var controller = CreateController(db, userId: uid1);
        var request = new CreateTaskRequest
        {
            Title  = "New Task",
            Description = "Details here",
            Status = "Pending",
        };

        var result = await controller.Create(request);

        var created = Assert.IsType<CreatedAtActionResult>(result);
        var response = Assert.IsType<TaskResponse>(created.Value);
        Assert.Equal("New Task", response.Title);
        Assert.Equal("Pending", response.Status);
        Assert.Equal(uid1, response.UserId);
    }

    [Fact]
    public async Task Create_Returns400_WhenStatusIsInvalid()
    {
        using var db = CreateDb();
        var (uid1, _) = await SeedUsersAsync(db);

        var controller = CreateController(db, userId: uid1);
        var request = new CreateTaskRequest { Title = "Bad", Status = "NotAStatus" };

        var result = await controller.Create(request);

        Assert.IsType<BadRequestObjectResult>(result);
    }

    // ── PUT /api/tasks/{id} ───────────────────────────────────────────────────

    [Fact]
    public async Task Update_Returns200_WhenOwnerUpdates()
    {
        using var db = CreateDb();
        var (uid1, _) = await SeedUsersAsync(db);

        var task = new TaskItem { Title = "Old Title", UserId = uid1, Status = TaskItemStatus.Pending };
        db.Tasks.Add(task);
        await db.SaveChangesAsync();

        var controller = CreateController(db, userId: uid1);
        var request = new UpdateTaskRequest { Title = "New Title", Status = "InProgress" };

        var result = await controller.Update(task.Id, request);

        var ok = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<TaskResponse>(ok.Value);
        Assert.Equal("New Title", response.Title);
        Assert.Equal("InProgress", response.Status);
    }

    [Fact]
    public async Task Update_Returns404_WhenTaskDoesNotExist()
    {
        using var db = CreateDb();
        var (uid1, _) = await SeedUsersAsync(db);

        var controller = CreateController(db, userId: uid1);
        var result = await controller.Update(999, new UpdateTaskRequest { Title = "X" });

        Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public async Task Update_Returns403_WhenNonOwnerUpdates()
    {
        using var db = CreateDb();
        var (uid1, uid2) = await SeedUsersAsync(db);

        var task = new TaskItem { Title = "Alice Task", UserId = uid1, Status = TaskItemStatus.Pending };
        db.Tasks.Add(task);
        await db.SaveChangesAsync();

        var controller = CreateController(db, userId: uid2); // Bob
        var result = await controller.Update(task.Id, new UpdateTaskRequest { Title = "Hacked" });

        Assert.IsType<ForbidResult>(result);
    }

    [Fact]
    public async Task Update_Returns400_WhenStatusIsInvalid()
    {
        using var db = CreateDb();
        var (uid1, _) = await SeedUsersAsync(db);

        var task = new TaskItem { Title = "Task", UserId = uid1, Status = TaskItemStatus.Pending };
        db.Tasks.Add(task);
        await db.SaveChangesAsync();

        var controller = CreateController(db, userId: uid1);
        var result = await controller.Update(task.Id, new UpdateTaskRequest { Status = "BadStatus" });

        Assert.IsType<BadRequestObjectResult>(result);
    }

    // ── DELETE /api/tasks/{id} ────────────────────────────────────────────────

    [Fact]
    public async Task Delete_Returns204_WhenOwnerDeletes()
    {
        using var db = CreateDb();
        var (uid1, _) = await SeedUsersAsync(db);

        var task = new TaskItem { Title = "Temp", UserId = uid1, Status = TaskItemStatus.Pending };
        db.Tasks.Add(task);
        await db.SaveChangesAsync();

        var controller = CreateController(db, userId: uid1);
        var result = await controller.Delete(task.Id);

        Assert.IsType<NoContentResult>(result);
        Assert.False(await db.Tasks.AnyAsync(t => t.Id == task.Id));
    }

    [Fact]
    public async Task Delete_Returns404_WhenTaskDoesNotExist()
    {
        using var db = CreateDb();
        await SeedUsersAsync(db);

        var controller = CreateController(db, userId: 1);
        var result = await controller.Delete(999);

        Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public async Task Delete_Returns403_WhenNonOwnerDeletes()
    {
        using var db = CreateDb();
        var (uid1, uid2) = await SeedUsersAsync(db);

        var task = new TaskItem { Title = "Alice Task", UserId = uid1, Status = TaskItemStatus.Pending };
        db.Tasks.Add(task);
        await db.SaveChangesAsync();

        var controller = CreateController(db, userId: uid2); // Bob
        var result = await controller.Delete(task.Id);

        Assert.IsType<ForbidResult>(result);

        // Task must still exist
        Assert.True(await db.Tasks.AnyAsync(t => t.Id == task.Id));
    }
}
