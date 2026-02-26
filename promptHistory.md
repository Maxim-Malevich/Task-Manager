# Prompt History — Task Manager

A detailed log of every prompt issued during the AI-assisted development of this project, including the exact (or close-to-exact) prompt text, session notes, and the outcomes produced by GitHub Copilot (Claude Sonnet 4.6).

---

## Prompt 1 — Project Scaffolding

### Prompt

> Create a new solution for a Task Manager app with two projects:
>
> - A React frontend using **Vite + TypeScript**. Place it in a `ClientApp` folder.
> - An **ASP.NET Core Web API** (minimal APIs or controllers) targeting **.NET 8**. Name it `TaskManager.Api`.
>
> Set up the solution so that the frontend can proxy API requests to the backend during development (e.g., configure Vite proxy). Provide the full file structure and code for both projects, along with instructions to run them.
>
> …then I asked Copilot to generate a **PowerShell script** so the entire structure could be created automatically.

### Result

- `setup.ps1` was generated and committed. Running it scaffolded the full file structure, installed npm dependencies, restored NuGet packages, set up the Vite proxy to `https://localhost:5001`, and trusted the dev certificate.
- After running the script, both projects were ready to start with `dotnet run` and `npm run dev`.

### Notes & Hints

- **Hint:** Specify the exact versions of Node, .NET SDK, or any libraries you require. The more specific you are, the less drift you get from defaults.
- **Local issues encountered (unrelated to Copilot's output):** Node.js version mismatch, PowerShell execution policy restrictions, and port conflicts. All were resolved with Copilot's guidance (e.g., `dotnet run --urls=https://localhost:5001` to pin the backend port).

---

## Prompt 2 — Database & Entity Framework Setup

### Prompt

> In the `TaskManager.Api` project, add Entity Framework Core and create an `AppDbContext` that connects to **SQLite**. Define two entities:
>
> - **User:** `Id`, `Email`, `PasswordHash`, `Role` (string — `"User"` or `"Admin"`)
> - **Task:** `Id`, `Title`, `Description`, `Status` (enum: `Pending`, `InProgress`, `Completed`), `UserId` (FK to User)
>
> Add a migration and provide the commands to create/update the database. Seed the database with one admin user and one regular user (hash passwords using **BCrypt**).

### Result

| File / Area               | Change                                                                             |
| ------------------------- | ---------------------------------------------------------------------------------- |
| `TaskManager.Api.csproj`  | Replaced SQL Server package with `Microsoft.EntityFrameworkCore.Sqlite`            |
| `appsettings.json`        | Connection string set to `Data Source=taskmanager.db`                              |
| `Program.cs`              | `UseSqlServer` → `UseSqlite`                                                       |
| Migrations                | Old SQL Server migration removed; fresh `InitialCreate` SQLite migration generated |
| `taskmanager.db`          | Database file created and migrations applied                                       |
| `.gitignore`              | Added `*.db` entries to prevent committing the local database                      |
| `copilot-instructions.md` | All SQL Server references updated to SQLite                                        |

---

## Prompt 3 — API Endpoints (CRUD for Tasks & Users)

### Prompt

> Create the following API endpoints in `TaskManager.Api` using controllers:
>
> - `GET /api/tasks` — returns all tasks for the authenticated user (filter by `userId`); admin can see all
> - `POST /api/tasks` — create a new task (associate with logged-in user)
> - `GET /api/tasks/{id}` — get a single task (check user permissions)
> - `PUT /api/tasks/{id}` — update a task
> - `DELETE /api/tasks/{id}` — delete a task
> - `GET /api/users` — (admin only) list all users
>
> For now, skip authentication — just accept a `userId` header for testing. Use `DbContext` and return appropriate HTTP status codes. Add DTOs for request/response to avoid exposing entities directly.

### Result

New files created:

| File                             | Purpose                                                          |
| -------------------------------- | ---------------------------------------------------------------- |
| `DTOs/TaskDtos.cs`               | `TaskResponse`, `CreateTaskRequest`, `UpdateTaskRequest` records |
| `DTOs/UserDtos.cs`               | `UserResponse` record (no password hash exposed)                 |
| `Controllers/TasksController.cs` | `GET` / `POST` / `PUT` / `DELETE` for `/api/tasks`               |
| `Controllers/UsersController.cs` | `GET /api/users` (admin only)                                    |

**Testing via Swagger** (`https://localhost:5001/swagger`) — temporary headers used before auth was wired up:

| Header        | Example | Purpose                |
| ------------- | ------- | ---------------------- |
| `X-User-Id`   | `1`     | Identifies the caller  |
| `X-User-Role` | `Admin` | Grants admin privilege |

**Access rules (pre-auth):**

- Regular users only see/edit/delete their own tasks
- Admins see all tasks and have access to `GET /api/users`
- `POST /api/tasks` always associates the task with the `X-User-Id` caller

---

## Prompt 4 — Authentication & Authorization

### Prompt

> Implement JWT authentication in the .NET API:
>
> - Add `Microsoft.AspNetCore.Authentication.JwtBearer`
> - Create a `TokenService` to generate JWT tokens containing user ID and role
> - Add an `AuthController` with `POST /api/auth/login` (verify password hash) and `POST /api/auth/register` (create user with hashed password)
> - Protect task and user endpoints with `[Authorize]`; admin-only endpoints use `[Authorize(Roles = "Admin")]`
> - Update task endpoints to read the authenticated user's ID from the token via `User.FindFirst(ClaimTypes.NameIdentifier)`

### Result

New files:

| File                            | Purpose                                                |
| ------------------------------- | ------------------------------------------------------ |
| `Services/ITokenService.cs`     | Interface for JWT token generation                     |
| `Services/TokenService.cs`      | Creates signed JWTs with `sub`, `email`, `role` claims |
| `DTOs/AuthDtos.cs`              | `LoginRequest`, `RegisterRequest`, `AuthResponse`      |
| `Controllers/AuthController.cs` | `POST /api/auth/register` and `POST /api/auth/login`   |

Updated files:

| File                     | Change                                                                                  |
| ------------------------ | --------------------------------------------------------------------------------------- |
| `TaskManager.Api.csproj` | Added `Microsoft.AspNetCore.Authentication.JwtBearer`                                   |
| `appsettings.json`       | Added `Jwt` config section (Key, Issuer, Audience, ExpiryMinutes)                       |
| `Program.cs`             | Registered JWT auth middleware, `ITokenService`, and Swagger Bearer security definition |
| `TasksController.cs`     | `[Authorize]` on controller; reads user ID from `JwtRegisteredClaimNames.Sub`           |
| `UsersController.cs`     | `[Authorize(Roles = "Admin")]`; header-based checks removed                             |

**Testing flow in Swagger:**

1. `POST /api/auth/login` → `{ "email": "admin@taskmanager.com", "password": "Admin@123" }`
2. Copy the returned token
3. Click **Authorize** (top right), paste as `Bearer <token>`
4. All protected endpoints now work

---

## Prompt 5 — Frontend: Layouts & Routing

### Prompt

> In the React frontend, create layout components in `src/layouts`:
>
> - **MainLayout** — header with Home / Login / Register links; footer; `<Outlet />`
> - **DashboardLayout** — sidebar with Dashboard / Tasks / Profile; header with user info; `<Outlet />`
> - **AdminLayout** — sidebar with Users / Tasks / Settings; `<Outlet />`
>
> Use React Router v6 to set up routes:
>
> - `/` — Home (public, MainLayout)
> - `/login`, `/register` — under MainLayout
> - `/dashboard` — Dashboard page (DashboardLayout)
> - `/tasks`, `/tasks/:id` — under DashboardLayout
> - `/admin` — AdminDashboard (AdminLayout)
> - `/admin/users` — under AdminLayout
>
> Add a basic `AuthContext` (user + token from `localStorage`). Protect routes: redirect to `/login` if unauthenticated; redirect non-admins away from admin routes.

### Result

```
src/
├── context/
│   └── AuthContext.tsx         # AuthProvider, useAuth, login/logout, localStorage persistence
├── components/
│   └── RouteGuards.tsx         # ProtectedRoute (→ /login), AdminRoute (→ /dashboard)
├── layouts/
│   ├── MainLayout.tsx          # Header (Home/Login/Register), Outlet, footer
│   ├── DashboardLayout.tsx     # Sidebar (Dashboard/Tasks/Profile), user info, logout
│   └── AdminLayout.tsx         # Sidebar (Admin/Users/Tasks), logout
├── pages/
│   ├── Home.tsx                # Public landing page
│   ├── Login.tsx               # POST /api/auth/login, saves token
│   ├── Register.tsx            # POST /api/auth/register
│   ├── Dashboard.tsx           # Summary cards
│   ├── TaskList.tsx            # Task table
│   ├── TaskDetail.tsx          # Single task view + delete
│   ├── Profile.tsx             # Current user info
│   ├── AdminDashboard.tsx      # Admin overview
│   ├── AdminUsers.tsx          # GET /api/users
│   └── NotFound.tsx            # 404
├── App.tsx                     # Full route tree
└── main.tsx                    # BrowserRouter + AuthProvider
```

**Route protection behaviour:**

- Unauthenticated users hitting `/dashboard`, `/tasks`, or `/admin` are redirected to `/login` (with the original path saved for redirect-back)
- Authenticated non-admins hitting `/admin/*` are redirected to `/dashboard`
- After login: admins go to `/admin`, regular users go to `/dashboard`

---

## Prompt 6 — Frontend: API Integration

### Prompt

> Create an API client in `src/api/client.ts` using `axios`. Set the base URL to the .NET API and automatically attach the JWT token from `localStorage` to the `Authorization` header.
>
> Implement service functions for tasks and users:
> `fetchTasks()`, `createTask()`, `updateTask()`, `deleteTask()`, `fetchTask(id)`, `fetchUsers()` (admin only)
>
> On the Dashboard: fetch and display a summary (task counts by status). On the Tasks page: list all tasks with edit/delete options. On TaskDetail: show the full task and allow editing. On AdminUsers: list all users. Add loading indicators and error messages.

### Result

**`TaskList.tsx`**

- Replaced direct Axios calls with `fetchTasks`, `createTask`, `deleteTask` from the service layer
- Added a "+ New Task" button that toggles an inline `TaskForm` card
- Per-row Edit link (navigates to `/tasks/:id`) and Delete button with optimistic removal + a confirmation dialog

**`TaskDetail.tsx`**

- Replaced direct Axios calls with `fetchTask`, `updateTask`, `deleteTask`
- Inline edit mode — "Edit Task" swaps the read view for a pre-populated `TaskForm`; saving calls `updateTask` and updates state in place
- Delete navigates back to `/tasks` on success

---

## Prompt 7 — Styling & UI Polish

### Prompt

> Add **Tailwind CSS** to the React project. Style all pages and components to be responsive and visually clean. Add a 404 Not Found page. Add confirmation dialogs for delete actions. Improve form validation on login/register.

### Result

- **Tailwind CSS v3** installed and configured via `tailwind.config.js` + `postcss.config.js`; old Vite default CSS replaced with clean Tailwind base on a `slate-100` background
- **`ConfirmDialog` component** (`src/components/ConfirmDialog.tsx`) — accessible modal via `createPortal`; supports Escape-key dismiss and click-outside-to-close; replaces all native `confirm()` calls
- **Responsive layouts** — `DashboardLayout` and `AdminLayout` have a collapsible sidebar (hamburger on mobile, always-visible on `md:+`)
- **Improved form validation** on `Login.tsx` and `Register.tsx`:
  - Inline field-level errors shown on blur
  - Email validated against regex; password requires 8+ characters
  - Register adds a confirm-password field and enforces at least one letter + one digit
  - Server errors shown in a styled alert banner

**All pages polished:**

| Page           | Tailwind treatment                                      |
| -------------- | ------------------------------------------------------- |
| Dashboard      | Stat cards with coloured accent bars; recent-tasks list |
| TaskList       | Card table with description preview                     |
| TaskDetail     | Status badge; edit/view toggle                          |
| AdminDashboard | Hover cards                                             |
| AdminUsers     | Role badges                                             |
| Profile        | Avatar initials + role badge                            |
| Home           | Feature cards                                           |
| NotFound       | Shows the attempted path                                |

> **Note:** During live testing a bug appeared — task creation was returning `400 Bad Request`. This was investigated and fixed before moving to the testing prompt (see Prompt 8 for the fix details).

---

## Prompt 8 — Bug Fix: POST /api/tasks Returns 400

### Prompt

> The `POST /api/tasks` endpoint returns `400 Bad Request` with the error:
> `"$.status could not be converted to TaskManager.Api.DTOs.CreateTaskRequest"`

### Root Cause

`CreateTaskRequest` was defined as a C# **positional `record`** with a `TaskItemStatus Status` parameter (an enum type):

```csharp
// ❌ Broken — positional record + enum parameter
public record CreateTaskRequest(
    [Required, MaxLength(200)] string Title,
    [MaxLength(1000)] string Description,
    TaskItemStatus Status = TaskItemStatus.Pending
);
```

`System.Text.Json` uses the constructor to deserialize positional records. When it receives `"status": "Pending"` (a JSON string), it cannot coerce the string into the enum via the constructor — so the entire model binding fails before the controller code even runs, producing no log output.

### Fix

Converted both request DTOs from positional records to plain `class` types with `{ get; set; }` properties and `string Status`:

```csharp
// ✅ Fixed — class with string Status
public class CreateTaskRequest
{
    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Description { get; set; }

    public string Status { get; set; } = "Pending";
}
```

Added `Enum.TryParse<TaskItemStatus>` in the controller to convert the string at runtime and return a proper `400` if the value is not valid:

```csharp
if (!Enum.TryParse<TaskItemStatus>(request.Status, ignoreCase: true, out var status))
    return BadRequest(new { error = $"Invalid status '{request.Status}'." });
```

---

## Prompt 9 — Tests & React Query Refactor

### Prompt

> Write unit tests for the API client functions using **Jest and React Testing Library**. Mock axios. Also write a simple test for the Dashboard component.
>
> For the backend, write a few **integration tests** for `TasksController` using an **in-memory database**.
>
> Refactor the frontend to use **React Query** for data fetching and caching. Extract data fetching logic into custom hooks.

### Result

#### Frontend — React Query Refactor

**New file: `src/hooks/useTasks.ts`**

Five custom hooks backed by `@tanstack/react-query`:

| Hook              | Type     | Description                                      |
| ----------------- | -------- | ------------------------------------------------ |
| `useTasks()`      | Query    | Fetches all tasks                                |
| `useTask(id)`     | Query    | Fetches a single task                            |
| `useCreateTask()` | Mutation | Creates a task; invalidates list cache           |
| `useUpdateTask()` | Mutation | Updates a task; invalidates list + detail caches |
| `useDeleteTask()` | Mutation | Deletes a task; invalidates list cache           |

Pages refactored to use hooks (all manual `useState` / `useEffect` / fetch logic removed):

- `Dashboard.tsx` → `useTasks()`
- `TaskList.tsx` → `useTasks()` + `useCreateTask()` + `useDeleteTask()`
- `TaskDetail.tsx` → `useTask()` + `useUpdateTask()` + `useDeleteTask()`
- `main.tsx` → wrapped with `QueryClientProvider` (30 s stale time, 1 retry)

#### Frontend — Vitest + React Testing Library

| File                                     | # Tests | Coverage                                             |
| ---------------------------------------- | ------- | ---------------------------------------------------- |
| `src/__tests__/api/taskService.test.ts`  | 6       | All 5 service functions + error propagation          |
| `src/__tests__/api/authService.test.ts`  | 3       | `login` / `register` happy paths + 401 error         |
| `src/__tests__/pages/Dashboard.test.tsx` | 5       | Loading, error, data rendered, empty state, greeting |

- Axios is mocked at the `../api/client` module level — no real HTTP
- Shared `test-utils.tsx` wraps components with `QueryClientProvider + MemoryRouter + AuthProvider`
- **Run:** `npm test` (inside `ClientApp/`)

#### Backend — xUnit Integration Tests

**New project:** `TaskManager.Api.Tests` (xUnit + EF Core InMemory), added to `TaskManager.sln`

**`Integration/TasksControllerTests.cs`** — 14 tests:

| Endpoint                 | Scenarios tested                                                                        |
| ------------------------ | --------------------------------------------------------------------------------------- |
| `GET /api/tasks`         | User sees only own tasks; admin sees all                                                |
| `GET /api/tasks/{id}`    | 200 for owner; 404 for missing; 403 for non-owner                                       |
| `POST /api/tasks`        | 201 with valid status; 400 for invalid status string                                    |
| `PUT /api/tasks/{id}`    | 200 for owner; 404 / 403 / 400 for edge cases                                           |
| `DELETE /api/tasks/{id}` | 204 for owner + DB record removed; 404 for missing; 403 for non-owner + record retained |

Each test gets its own isolated in-memory DB. Auth is faked by setting a `ClaimsPrincipal` directly on the controller's `ControllerContext` — no HTTP server required.

- **Run:** `dotnet test -c Release`
  _(Use Release config to avoid a file-lock conflict with the running Debug API binary)_

---

## Prompt 10 — README & Prompt History

### Prompt

> Create a `README.md` file which will contain: overview of the Task Manager, prompt history, tools/models/MCP used, and an insights section (leave it blank).
>
> Also add a more detailed prompt history to a separate file (`promptHistory.md`).

### Result

- `README.md` created at the project root with four sections: Overview, Prompt History (summary), Tools/Models/MCP, and Insights (blank placeholder)
- `promptHistory.md` created with this full detailed log
