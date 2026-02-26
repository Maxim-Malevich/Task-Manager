import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTask, useUpdateTask, useDeleteTask } from "../hooks/useTasks";
import type { UpdateTaskPayload } from "../api/types";
import TaskForm from "../components/TaskForm";
import ConfirmDialog from "../components/ConfirmDialog";

const STATUS_STYLES: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-800",
  InProgress: "bg-violet-100 text-violet-800",
  Completed: "bg-emerald-100 text-emerald-800",
};

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const numId = Number(id);

  const { data: task, isLoading: loading, isError } = useTask(numId);
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();

  const [editing, setEditing] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const error = isError ? "Task not found or access denied." : "";
  const deleting = deleteTaskMutation.isPending;

  async function handleDelete() {
    setShowConfirmDelete(false);
    await deleteTaskMutation.mutateAsync(numId);
    navigate("/tasks");
  }

  if (loading) {
    return <p className="text-slate-500">Loading...</p>;
  }
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-3">{error}</p>
        <Link to="/tasks" className="text-blue-600 text-sm hover:underline">
          Back to tasks
        </Link>
      </div>
    );
  }
  if (!task) return null;

  return (
    <div className="max-w-xl">
      <Link
        to="/tasks"
        className="text-sm text-slate-500 hover:text-blue-600 flex items-center gap-1 mb-4"
      >
        &larr; Back to Tasks
      </Link>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        {editing ? (
          <>
            <h2 className="text-lg font-bold text-slate-800 mb-4">Edit Task</h2>
            <TaskForm
              initialValues={{
                title: task.title,
                description: task.description ?? "",
                status: task.status as "Pending" | "InProgress" | "Completed",
              }}
              onSubmit={async (payload: UpdateTaskPayload) => {
                await updateTaskMutation.mutateAsync({ id: task.id, payload });
                setEditing(false);
              }}
              onCancel={() => setEditing(false)}
              submitLabel="Save Changes"
            />
          </>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4 mb-4">
              <h2 className="text-xl font-bold text-slate-800 leading-snug">
                {task.title}
              </h2>
              <span
                className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[task.status] ?? "bg-slate-100 text-slate-600"}`}
              >
                {task.status === "InProgress" ? "In Progress" : task.status}
              </span>
            </div>

            <p className="text-slate-600 text-sm min-h-[3rem] mb-6">
              {task.description || (
                <span className="italic text-slate-400">
                  No description provided.
                </span>
              )}
            </p>

            <div className="flex gap-3 pt-2 border-t border-slate-100">
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => setShowConfirmDelete(true)}
                disabled={deleting}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </>
        )}
      </div>

      {showConfirmDelete && (
        <ConfirmDialog
          title="Delete Task"
          message={`Are you sure you want to delete "${task.title}"? This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setShowConfirmDelete(false)}
        />
      )}
    </div>
  );
}
