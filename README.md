# Task Manager

A full-stack task management application built with **ASP.NET Core 8** and **React 18 + TypeScript**.

---

## Overview

Task Manager is a monorepo web application that allows users to create, read, update, and delete personal tasks. It features JWT-based authentication with role separation (User / Admin), a responsive Tailwind CSS UI, and a RESTful API backed by SQLite.

### Architecture

```
Task Manager/
├── TaskManager.Api/          # ASP.NET Core 8 Web API
│   ├── Controllers/          # AuthController, TasksController, UsersController
│   ├── Data/                 # AppDbContext (EF Core)
│   ├── DTOs/                 # Request/Response data transfer objects
│   ├── Entities/             # User, TaskItem domain models
│   ├── Services/             # TokenService (JWT)
│   └── Program.cs            # App bootstrap, DI, middleware pipeline
├── ClientApp/                # React 18 + TypeScript (Vite)
│   └── src/
│       ├── api/              # Axios client + service functions
│       ├── components/       # TaskForm, ConfirmDialog, RouteGuards
│       ├── context/          # AuthContext (JWT stored in localStorage)
│       ├── hooks/            # React Query custom hooks (useTasks, etc.)
│       ├── layouts/          # AppLayout
│       └── pages/            # Dashboard, TaskList, TaskDetail, Login, Register, …
└── TaskManager.Api.Tests/    # xUnit integration test project
```

### Tech Stack

| Layer                  | Technology                                                   |
| ---------------------- | ------------------------------------------------------------ |
| Backend framework      | ASP.NET Core 8 Web API                                       |
| ORM                    | Entity Framework Core 8                                      |
| Database               | SQLite (dev)                                                 |
| Auth                   | JWT Bearer (`Microsoft.AspNetCore.Authentication.JwtBearer`) |
| Password hashing       | BCrypt.Net-Next                                              |
| API docs               | Swagger / Swashbuckle                                        |
| Frontend framework     | React 18 + TypeScript                                        |
| Build tool             | Vite 7                                                       |
| Routing                | React Router v6                                              |
| HTTP client            | Axios                                                        |
| Server-state / caching | TanStack React Query v5                                      |
| Styling                | Tailwind CSS v3                                              |
| Frontend tests         | Vitest + React Testing Library + jsdom                       |
| Backend tests          | xUnit + EF Core InMemory                                     |

### Key Features

- **JWT authentication** — register, login; token persisted to `localStorage`
- **Role-based access** — `User` sees only their own tasks; `Admin` sees all tasks
- **Full CRUD for tasks** — create, list, view, edit, delete with confirmation dialogs
- **React Query caching** — automatic background refetch, 30 s stale time, cache invalidation on mutations
- **Custom hooks** — `useTasks`, `useTask`, `useCreateTask`, `useUpdateTask`, `useDeleteTask`
- **Responsive UI** — Tailwind stat cards, table, status badges, empty states
- **Swagger UI** — available at `https://localhost:5001/swagger` in development

### Default Dev Credentials

| Role  | Email                 | Password  |
| ----- | --------------------- | --------- |
| Admin | admin@taskmanager.com | Admin@123 |
| User  | user@taskmanager.com  | User@123  |

### Running Locally

```powershell
# 1 — Initial setup (scaffold, restore, cert trust)
.\setup.ps1

# 2 — Start backend
cd TaskManager.Api
dotnet run --urls=https://localhost:5001

# 3 — Start frontend (separate terminal)
cd ClientApp
npm run dev
# App: http://localhost:5173
# API: https://localhost:5001/swagger
```

### Running Tests

```powershell
# Frontend (Vitest)
cd ClientApp
npm test

# Backend (xUnit) — use Release to avoid locking the running Debug binary
cd TaskManager.Api.Tests
dotnet test -c Release
```

---

## Prompt History

The application was built incrementally through a series of AI-assisted prompts in a single VS Code Copilot session. Below is a brief summary of each prompt. For the full detailed prompt history — including exact wording, results, and notes — see [promptHistory.md](promptHistory.md).

1. **Project scaffold** — "Set up a full-stack Task Manager with a React (Vite, TypeScript) frontend and ASP.NET Core 8 backend. Use EF Core + SQLite, JWT auth (no Identity), BCrypt for passwords, and Tailwind CSS."

2. **Backend API** — "Implement the full CRUD API for tasks (`TasksController`) and auth endpoints (`AuthController`) with JWT token generation. Use DTOs, never expose EF entities directly."

3. **Frontend pages** — "Build all React pages: Login, Register, Dashboard, TaskList, TaskDetail, Profile, AdminDashboard, AdminUsers. Use React Router v6 and Axios. Wire up the AuthContext."

4. **Styling pass** — "Apply Tailwind CSS throughout — responsive layout, stat cards on Dashboard, table on TaskList, status badges, ConfirmDialog component."

5. **Bug fix — POST /api/tasks 400** — "The task creation endpoint returns 400. `$.status could not be converted to TaskManager.Api.DTOs.CreateTaskRequest`."
   - Root cause identified: `CreateTaskRequest` was a positional C# `record` with `TaskItemStatus Status` (enum type) — `System.Text.Json` cannot deserialize a JSON string into an enum via positional record constructor.
   - Fix: converted both `CreateTaskRequest` and `UpdateTaskRequest` from positional `record` types to `class` with `string Status` property; added `Enum.TryParse<TaskItemStatus>` in controller.

6. **Tests + React Query refactor** — "Write unit tests for the API client functions using Jest and React Testing Library. Mock axios. Write a simple test for the Dashboard component. For the backend, write integration tests for `TasksController` using an in-memory database. Refactor the frontend to use React Query for data fetching and caching. Extract data fetching logic into custom hooks."

7. **README** — "Create a README.md with overview, prompt history, tools/models/MCP used, and an insights section."

---

## Tools, Models & MCP Used

### AI Model

| Item          | Detail                                                                                                                                               |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Model**     | Claude Sonnet 4.6                                                                                                                                    |
| **Interface** | GitHub Copilot (VS Code extension)                                                                                                                   |
| **Mode**      | Agentic / Edit mode — the model directly created and edited files, ran terminal commands, and iterated on errors without requiring manual copy-paste |

### VS Code Tools (MCP-style capabilities used by the agent)

| Tool                                                      | Purpose                                             |
| --------------------------------------------------------- | --------------------------------------------------- |
| `create_file`                                             | Scaffold new source files and test files            |
| `replace_string_in_file` / `multi_replace_string_in_file` | Targeted edits to existing files                    |
| `read_file`                                               | Read source files for context before editing        |
| `run_in_terminal`                                         | Install npm/NuGet packages, run builds, run tests   |
| `list_dir` / `file_search`                                | Navigate and discover the workspace structure       |
| `grep_search` / `semantic_search`                         | Find symbols and usage patterns across the codebase |
| `get_errors`                                              | Validate changes, catch type/compile errors         |
| `manage_todo_list`                                        | Track multi-step task progress across the session   |

### External Packages & Frameworks

**Backend**

- `Microsoft.EntityFrameworkCore` + `Microsoft.EntityFrameworkCore.Sqlite`
- `Microsoft.AspNetCore.Authentication.JwtBearer`
- `BCrypt.Net-Next`
- `Swashbuckle.AspNetCore`
- `Microsoft.EntityFrameworkCore.InMemory` (tests)
- `xunit` + `xunit.runner.visualstudio`

**Frontend**

- `@tanstack/react-query`
- `axios`
- `react-router-dom`
- `tailwindcss`
- `vitest` + `@vitest/coverage-v8`
- `@testing-library/react` + `@testing-library/jest-dom` + `@testing-library/user-event`

---

## Insights

- Be more specific with versions and etc
- If smth was good ask not to rewrite that part or to leave it as it is
- Not all modes could change/createw files
