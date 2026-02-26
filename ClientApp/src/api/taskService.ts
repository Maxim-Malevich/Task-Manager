import apiClient from "./client";
import type { Task, CreateTaskPayload, UpdateTaskPayload } from "./types";

/** Fetch all tasks for the authenticated user (admin sees all). */
export async function fetchTasks(): Promise<Task[]> {
  const { data } = await apiClient.get<Task[]>("/tasks");
  return data;
}

/** Fetch a single task by ID. */
export async function fetchTask(id: number): Promise<Task> {
  const { data } = await apiClient.get<Task>(`/tasks/${id}`);
  return data;
}

/** Create a new task. */
export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  const { data } = await apiClient.post<Task>("/tasks", payload);
  return data;
}

/** Update an existing task. */
export async function updateTask(
  id: number,
  payload: UpdateTaskPayload,
): Promise<Task> {
  const { data } = await apiClient.put<Task>(`/tasks/${id}`, payload);
  return data;
}

/** Delete a task by ID. */
export async function deleteTask(id: number): Promise<void> {
  await apiClient.delete(`/tasks/${id}`);
}
