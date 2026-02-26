import { useState } from "react";
import { Link } from "react-router-dom";
import { useTasks, useCreateTask, useDeleteTask } from "../hooks/useTasks";
import type { CreateTaskPayload } from "../api/types";
import TaskForm from "../components/TaskForm";
import ConfirmDialog from "../components/ConfirmDialog";

const STATUS_STYLES: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-800",
  InProgress: "bg-violet-100 text-violet-800",
  Completed: "bg-emerald-100 text-emerald-800",
};

export default function TaskList() {
  const { data: tasks = [], isLoading: loading, isError } = useTasks();
  const createTaskMutation = useCreateTask();
  const deleteTaskMutation = useDeleteTask();

  const [showCreate, setShowCreate] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  async function handleCreate(payload: CreateTaskPayload) {
    await createTaskMutation.mutateAsync(payload);
    setShowCreate(false);
  }

  async function handleDelete(id: number) {
    setConfirmDeleteId(null);
    await deleteTaskMutation.mutateAsync(id);
  }

  const taskToDelete = tasks.find((t) => t.id === confirmDeleteId);
  const deletingId = deleteTaskMutation.isPending
    ? (deleteTaskMutation.variables ?? null)
    : null;
  const error = isError
    ? "Failed to load tasks."
    : createTaskMutation.isError
      ? "Failed to save task."
      : deleteTaskMutation.isError
        ? "Failed to delete task."
        : "";

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-800">My Tasks</h2>
        <button
          onClick={() => setShowCreate((v) => !v)}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${showCreate ? "bg-slate-200 text-slate-700 hover:bg-slate-300" : "bg-blue-600 text-white hover:bg-blue-700"}`}
        >
          {showCreate ? "Cancel" : "+ New Task"}
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6 max-w-lg">
          <h3 className="text-base font-semibold text-slate-800 mb-4">
            New Task
          </h3>
          <TaskForm
            onSubmit={handleCreate}
            onCancel={() => setShowCreate(false)}
            submitLabel="Create Task"
          />
        </div>
      )}

      {loading && <p className="text-slate-500">Loading...</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      {!loading && !error && tasks.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <p className="text-4xl mb-3"></p>
          <p className="font-medium">No tasks yet</p>
          <p className="text-sm">
            Create your first task above to get started.
          </p>
        </div>
      )}

      {/* Task table */}
      {!loading && !error && tasks.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 font-semibold text-slate-600">
                  Title
                </th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">
                  Status
                </th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tasks.map((task) => (
                <tr
                  key={task.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link
                      to={`/tasks/${task.id}`}
                      className="font-medium text-slate-800 hover:text-blue-600"
                    >
                      {task.title}
                    </Link>
                    {task.description && (
                      <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">
                        {task.description}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[task.status] ?? "bg-slate-100 text-slate-600"}`}
                    >
                      {task.status === "InProgress"
                        ? "In Progress"
                        : task.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/tasks/${task.id}`}
                        className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => setConfirmDeleteId(task.id)}
                        disabled={deletingId === task.id}
                        className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {deletingId === task.id ? "..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirm delete dialog */}
      {confirmDeleteId !== null && taskToDelete && (
        <ConfirmDialog
          title="Delete Task"
          message={`Are you sure you want to delete "${taskToDelete.title}"? This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={() => handleDelete(confirmDeleteId)}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
    </div>
  );
}
