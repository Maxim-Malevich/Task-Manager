// Shared API types matching the .NET DTOs

export type TaskStatus = "Pending" | "InProgress" | "Completed";

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  userId: number;
}

export interface CreateTaskPayload {
  title: string;
  description: string;
  status: TaskStatus;
}

export interface UpdateTaskPayload {
  title: string;
  description: string;
  status: TaskStatus;
}

export interface User {
  id: number;
  email: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  role: string;
}
