import apiClient from "./client";
import type { User } from "./types";

/** Fetch all users (admin only). */
export async function fetchUsers(): Promise<User[]> {
  const { data } = await apiClient.get<User[]>("/users");
  return data;
}
