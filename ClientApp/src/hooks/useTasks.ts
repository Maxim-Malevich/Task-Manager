import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchTasks,
  fetchTask,
  createTask,
  updateTask,
  deleteTask,
} from "../api/taskService";
import type { CreateTaskPayload, UpdateTaskPayload } from "../api/types";

// ─── Query keys ────────────────────────────────────────────────────────────

export const tasksKey = ["tasks"] as const;
export const taskKey = (id: number) => ["tasks", id] as const;

// ─── Query hooks ───────────────────────────────────────────────────────────

/** Fetches all tasks for the current user. Admins receive all tasks. */
export function useTasks() {
  return useQuery({
    queryKey: tasksKey,
    queryFn: fetchTasks,
  });
}

/** Fetches a single task by ID. */
export function useTask(id: number) {
  return useQuery({
    queryKey: taskKey(id),
    queryFn: () => fetchTask(id),
    enabled: id > 0,
  });
}

// ─── Mutation hooks ────────────────────────────────────────────────────────

/** Creates a new task and invalidates the tasks list cache. */
export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTaskPayload) => createTask(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tasksKey });
    },
  });
}

/** Updates a task and refreshes both the list and the individual task cache. */
export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateTaskPayload }) =>
      updateTask(id, payload),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: tasksKey });
      qc.invalidateQueries({ queryKey: taskKey(id) });
    },
  });
}

/** Deletes a task and invalidates the tasks list cache. */
export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteTask(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tasksKey });
    },
  });
}
