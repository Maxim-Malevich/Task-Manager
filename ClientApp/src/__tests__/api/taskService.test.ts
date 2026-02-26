/**
 * Unit tests for taskService.ts
 * axios is mocked via vi.mock so no real network requests are made.
 */
import { describe, it, vi, expect, beforeEach } from "vitest";
import type { Mock } from "vitest";
import apiClient from "../../api/client";
import {
  fetchTasks,
  fetchTask,
  createTask,
  updateTask,
  deleteTask,
} from "../../api/taskService";
import type { Task } from "../../api/types";

// Mock the shared axios instance
vi.mock("../../api/client", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockGet = apiClient.get as Mock;
const mockPost = apiClient.post as Mock;
const mockPut = apiClient.put as Mock;
const mockDelete = apiClient.delete as Mock;

const TASK: Task = {
  id: 1,
  title: "Write tests",
  description: "Cover all services",
  status: "Pending",
  userId: 42,
};

beforeEach(() => {
  vi.clearAllMocks();
});

// ── fetchTasks ───────────────────────────────────────────────────────────────

describe("fetchTasks", () => {
  it("calls GET /tasks and returns the data", async () => {
    mockGet.mockResolvedValue({ data: [TASK] });

    const result = await fetchTasks();

    expect(mockGet).toHaveBeenCalledOnce();
    expect(mockGet).toHaveBeenCalledWith("/tasks");
    expect(result).toEqual([TASK]);
  });

  it("propagates errors from the API client", async () => {
    mockGet.mockRejectedValue(new Error("Network Error"));

    await expect(fetchTasks()).rejects.toThrow("Network Error");
  });
});

// ── fetchTask ────────────────────────────────────────────────────────────────

describe("fetchTask", () => {
  it("calls GET /tasks/:id and returns a single task", async () => {
    mockGet.mockResolvedValue({ data: TASK });

    const result = await fetchTask(1);

    expect(mockGet).toHaveBeenCalledWith("/tasks/1");
    expect(result).toEqual(TASK);
  });
});

// ── createTask ───────────────────────────────────────────────────────────────

describe("createTask", () => {
  it("calls POST /tasks with the payload and returns the created task", async () => {
    mockPost.mockResolvedValue({ data: TASK });

    const payload = {
      title: "Write tests",
      description: "",
      status: "Pending" as const,
    };
    const result = await createTask(payload);

    expect(mockPost).toHaveBeenCalledOnce();
    expect(mockPost).toHaveBeenCalledWith("/tasks", payload);
    expect(result).toEqual(TASK);
  });
});

// ── updateTask ───────────────────────────────────────────────────────────────

describe("updateTask", () => {
  it("calls PUT /tasks/:id with the payload and returns the updated task", async () => {
    const updated: Task = {
      ...TASK,
      title: "Updated title",
      status: "InProgress",
    };
    mockPut.mockResolvedValue({ data: updated });

    const payload = {
      title: "Updated title",
      description: "",
      status: "InProgress" as const,
    };
    const result = await updateTask(1, payload);

    expect(mockPut).toHaveBeenCalledWith("/tasks/1", payload);
    expect(result).toEqual(updated);
  });
});

// ── deleteTask ───────────────────────────────────────────────────────────────

describe("deleteTask", () => {
  it("calls DELETE /tasks/:id", async () => {
    mockDelete.mockResolvedValue({ data: undefined });

    await deleteTask(1);

    expect(mockDelete).toHaveBeenCalledOnce();
    expect(mockDelete).toHaveBeenCalledWith("/tasks/1");
  });
});
