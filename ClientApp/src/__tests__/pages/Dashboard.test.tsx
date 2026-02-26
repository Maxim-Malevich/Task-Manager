/**
 * Simple unit tests for the Dashboard page.
 * The `useTasks` hook is mocked so no real API calls are made.
 */
import { describe, it, vi, beforeEach, expect } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../test-utils";
import Dashboard from "../../pages/Dashboard";
import * as useTasksModule from "../../hooks/useTasks";

// Spy on the named export so we can control what useTasks returns
vi.mock("../../hooks/useTasks");

const mockUseTasks = vi.mocked(useTasksModule.useTasks);

// Seed localStorage so AuthContext has a logged-in user
const STORED_USER = JSON.stringify({ email: "alice@test.com", role: "User" });

beforeEach(() => {
  localStorage.setItem("tm_token", "fake-jwt");
  localStorage.setItem("tm_user", STORED_USER);
});

afterEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe("Dashboard", () => {
  it("shows a loading indicator while tasks are being fetched", () => {
    // @ts-expect-error – we only need the subset used by the component
    mockUseTasks.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    renderWithProviders(<Dashboard />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("shows an error message when the tasks query fails", () => {
    // @ts-expect-error
    mockUseTasks.mockReturnValue({ data: [], isLoading: false, isError: true });

    renderWithProviders(<Dashboard />);

    expect(screen.getByText("Failed to load tasks.")).toBeInTheDocument();
  });

  it("renders stat cards and the recent-tasks panel when data arrives", async () => {
    const tasks = [
      {
        id: 1,
        title: "Fix bug",
        description: "",
        status: "Pending",
        userId: 1,
      },
      {
        id: 2,
        title: "Write docs",
        description: "",
        status: "InProgress",
        userId: 1,
      },
      {
        id: 3,
        title: "Deploy app",
        description: "",
        status: "Completed",
        userId: 1,
      },
    ];
    // @ts-expect-error
    mockUseTasks.mockReturnValue({
      data: tasks,
      isLoading: false,
      isError: false,
    });

    renderWithProviders(<Dashboard />);

    // Stat cards are present
    expect(screen.getByText("Total")).toBeInTheDocument();
    // The status labels appear in both stat cards and task badges, so use getAllByText
    expect(screen.getAllByText("Pending").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Completed").length).toBeGreaterThanOrEqual(1);
    // "In Progress" only appears in the stat card (badge says "In Progress" too for InProgress)
    expect(screen.getAllByText("In Progress").length).toBeGreaterThanOrEqual(1);

    // Counts – total=3 is unique
    expect(screen.getByText("3")).toBeInTheDocument();

    // Recent tasks
    expect(screen.getByText("Fix bug")).toBeInTheDocument();
    expect(screen.getByText("Write docs")).toBeInTheDocument();
    expect(screen.getByText("Deploy app")).toBeInTheDocument();
  });

  it("shows the empty-state message when the user has no tasks", async () => {
    // @ts-expect-error
    mockUseTasks.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });

    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument();
    });
  });

  it("greets the user by the local part of their email", () => {
    // @ts-expect-error
    mockUseTasks.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });

    renderWithProviders(<Dashboard />);

    expect(screen.getByText(/welcome back, alice/i)).toBeInTheDocument();
  });
});
