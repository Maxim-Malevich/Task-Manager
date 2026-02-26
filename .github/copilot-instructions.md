# 🧠 Task Manager AI Coding Agent Guide

This project is a full-stack **Task Manager** app with a React (Vite, TypeScript) frontend and ASP.NET Core 8 backend. Use these conventions and workflows to maximize productivity and consistency.

---

## 🚦 Project Architecture & Workflows

- **Monorepo**: Backend (`TaskManager.Api`) and frontend (`ClientApp`) are sibling folders. All setup is automated via [setup.ps1](../../setup.ps1).
- **Backend**: ASP.NET Core 8 Web API (controllers, not minimal APIs), Entity Framework Core, JWT auth (custom, no Identity), BCrypt.Net-Next for password hashing, SQLite for dev.
- **Frontend**: React 18+ (TypeScript), Vite, React Router v6, Axios, Context API + useReducer for auth. Tailwind CSS is optional.
- **Dev Experience**:
  - Run `setup.ps1` to scaffold both backend and frontend, install dependencies, and set up CORS/dev certs.
  - Start backend: `cd TaskManager.Api; dotnet run`
  - Start frontend: `cd ClientApp; npm run dev`
  - API: https://localhost:5001/swagger
  - App: http://localhost:5173

## 🗂️ Key Patterns & Conventions

- **C#**: Use file-scoped namespaces, PascalCase for public, camelCase for private, prefix interfaces with `I`. Use XML docs for public APIs. Prefer dependency injection via constructor. Organize by feature/domain.
- **React**: Functional components with hooks, TypeScript interfaces for props/state, organize by feature, use custom hooks for shared logic. Use strict mode in `tsconfig.json`.
- **EF Core**: Use `DbContext` with constructor injection, separate entity configs, use `AsNoTracking` for queries, small/focused migrations. Database file: `taskmanager.db` (SQLite, auto-created on first run).
- **API**: Place controllers in `TaskManager.Api/Controllers`. Use DTOs for all API input/output. Never expose EF entities directly.
- **Frontend API Calls**: Use Axios, always call `/api/*` endpoints (proxied in dev via Vite config).
- **Auth**: JWT-based, roles User/Admin. Store token in memory (not localStorage). Use React Context for auth state.
- **Error Handling**: Return user-friendly errors from API, display in UI. Handle network failures and empty states.

## 🛠️ Project-Specific Details

- **Setup**: All initial scaffolding, config, and sample code is in [setup.ps1](../../setup.ps1). Review this file for up-to-date structure and dependencies.
- **.gitignore**: Covers .NET, Node, Rider, and env files.
- **Swagger**: Enabled in dev for API docs.
- **CORS**: Only enabled for `http://localhost:5173` in dev.
- **Testing**: Use xUnit/NUnit for backend, React Testing Library/Jest for frontend.

## 📁 Reference Files

- [setup.ps1](../../setup.ps1): End-to-end project scaffolding and conventions
- [.github/instructions/csharp.instructions.md](../instructions/csharp.instructions.md): C# code style and structure
- [.github/instructions/reactjs.instructions.md](../instructions/reactjs.instructions.md): React/TypeScript patterns
- [.github/prompts/dotnet-best-practices.prompt.md](../prompts/dotnet-best-practices.prompt.md): .NET/C# best practices
- [.github/prompts/ef-core.prompt.md](../prompts/ef-core.prompt.md): Entity Framework Core best practices

---

**When in doubt, check [setup.ps1](../../setup.ps1) and the .github/instructions directory for the latest project conventions.**
2. **The actual code** – with **file paths** clearly indicated.

3. **Any necessary instructions** (e.g., commands to run, environment variables to set).
