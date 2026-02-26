#Requires -Version 5.1
$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

Write-Host "==> Creating Task Manager solution..." -ForegroundColor Cyan

# ─────────────────────────────────────────────
# 1. Solution
# ─────────────────────────────────────────────
Set-Location $root
dotnet new sln -n TaskManager --force

# ─────────────────────────────────────────────
# 2. ASP.NET Core Web API
# ─────────────────────────────────────────────
Write-Host "==> Scaffolding TaskManager.Api..." -ForegroundColor Cyan
dotnet new webapi -n TaskManager.Api -o TaskManager.Api --use-controllers --force
dotnet sln add TaskManager.Api/TaskManager.Api.csproj

# ─────────────────────────────────────────────
# Helper: write file and ensure directory exists
# ─────────────────────────────────────────────
function Write-File($path, $content) {
    $dir = Split-Path $path -Parent
    if ($dir -and !(Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    Set-Content -Path $path -Value $content -Encoding UTF8
}

# ─────────────────────────────────────────────
# 3. TaskManager.Api files
# ─────────────────────────────────────────────
Write-File "TaskManager.Api/TaskManager.Api.csproj" @'
<Project Sdk="Microsoft.NET.Sdk.Web">

  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <RootNamespace>TaskManager.Api</RootNamespace>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.AspNetCore.OpenApi" Version="8.0.0" />
    <PackageReference Include="Swashbuckle.AspNetCore" Version="6.5.0" />
  </ItemGroup>

</Project>
'@

Write-File "TaskManager.Api/Program.cs" @'
using TaskManager.Api;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy(Policies.DevCors, policy =>
    {
        policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseCors(Policies.DevCors);
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
'@

Write-File "TaskManager.Api/Policies.cs" @'
namespace TaskManager.Api;

internal static class Policies
{
    internal const string DevCors = "DevCors";
}
'@

Write-File "TaskManager.Api/Controllers/HealthController.cs" @'
using Microsoft.AspNetCore.Mvc;

namespace TaskManager.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get() =>
        Ok(new { status = "Healthy", timestamp = DateTime.UtcNow });
}
'@

Write-File "TaskManager.Api/appsettings.json" @'
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
'@

Write-File "TaskManager.Api/appsettings.Development.json" @'
{
  "Logging": {
    "LogLevel": {
      "Default": "Debug",
      "Microsoft.AspNetCore": "Information"
    }
  }
}
'@

# Remove template files we replaced
@(
    "TaskManager.Api/Controllers/WeatherForecastController.cs",
    "TaskManager.Api/WeatherForecast.cs"
) | ForEach-Object { if (Test-Path $_) { Remove-Item $_ -Force } }

# ─────────────────────────────────────────────
# 4. Vite + React frontend
# ─────────────────────────────────────────────

Write-Host "==> Scaffolding ClientApp (Vite + React + TypeScript)..." -ForegroundColor Cyan
npx create-vite@latest ClientApp --template react-ts --yes

Set-Location "$root/ClientApp"
npm install
npm install axios react-router-dom
npm install -D @types/react @types/react-dom

Set-Location $root

# ─────────────────────────────────────────────
# 5. Frontend files
# ─────────────────────────────────────────────
Write-File "ClientApp/vite.config.ts" @'
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "https://localhost:5001",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
'@

Write-File "ClientApp/index.html" @'
<!DOCTYPE html>
<html lang="en"><head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Task Manager</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
'@

Write-File "ClientApp/src/main.tsx" @'
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
'@

Write-File "ClientApp/src/App.tsx" @'
import { useEffect, useState } from "react";
import axios from "axios";

interface HealthResponse {
  status: string;
  timestamp: string;
}

function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get<HealthResponse>("/api/health")
      .then(({ data }) => setHealth(data))
      .catch(() =>
        setError("Failed to reach the API. Is the backend running?")
      );
  }, []);

  return (
    <main style={{ fontFamily: "sans-serif", padding: "2rem" }}>
      <h1>Task Manager</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {health && (
        <p style={{ color: "green" }}>
          API status: <strong>{health.status}</strong> — {health.timestamp}
        </p>
      )}
    </main>
  );
}

export default App;
'@

Write-File "ClientApp/src/vite-env.d.ts" @'
/// <reference types="vite/client" />
'@

# ─────────────────────────────────────────────
# 6. .gitignore
# ─────────────────────────────────────────────
Write-File ".gitignore" @'
# .NET
bin/
obj/
*.user
*.suo
.vs/

# Node
node_modules/
ClientApp/dist/

# Rider
.idea/

# Env
.env
.env.local
'@

# ─────────────────────────────────────────────
# 7. Trust HTTPS dev cert
# ─────────────────────────────────────────────
Write-Host "==> Trusting .NET dev certificate..." -ForegroundColor Cyan
dotnet dev-certs https --trust

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "  Terminal 1 — Backend:" -ForegroundColor Yellow
Write-Host "    cd TaskManager.Api; dotnet run"
Write-Host ""
Write-Host "  Terminal 2 — Frontend:" -ForegroundColor Yellow
Write-Host "    cd ClientApp; npm run dev"
Write-Host ""
Write-Host "  Swagger UI: https://localhost:5001/swagger"
Write-Host "  App:        http://localhost:5173"
