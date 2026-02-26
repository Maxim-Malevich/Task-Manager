import { useAuth } from "../context/AuthContext";
import { useTasks } from "../hooks/useTasks";
import type { Task } from "../api/types";
import { Link } from "react-router-dom";

const STATUS_STYLES: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-800",
  InProgress: "bg-violet-100 text-violet-800",
  Completed: "bg-emerald-100 text-emerald-800",
};

export default function Dashboard() {
  const { user } = useAuth();
  const { data: tasks = [], isLoading: loading, isError } = useTasks();

  const counts = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "Pending").length,
    inProgress: tasks.filter((t) => t.status === "InProgress").length,
    completed: tasks.filter((t) => t.status === "Completed").length,
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">
          Welcome back, {user?.email?.split("@")[0]}
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Here is a summary of your tasks.
        </p>
      </div>

      {loading && <p className="text-slate-500">Loading...</p>}
      {isError && <p className="text-red-600 text-sm">Failed to load tasks.</p>}

      {!loading && !isError && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total" value={counts.total} color="bg-blue-500" />
            <StatCard
              label="Pending"
              value={counts.pending}
              color="bg-amber-500"
            />
            <StatCard
              label="In Progress"
              value={counts.inProgress}
              color="bg-violet-500"
            />
            <StatCard
              label="Completed"
              value={counts.completed}
              color="bg-emerald-500"
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-700 text-sm">
                Recent Tasks
              </h3>
              <Link
                to="/tasks"
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                View all
              </Link>
            </div>

            {tasks.length === 0 ? (
              <div className="px-5 py-8 text-center text-slate-400 text-sm">
                No tasks yet.{" "}
                <Link to="/tasks" className="text-blue-600 hover:underline">
                  Create your first task
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {tasks.slice(0, 5).map((t) => (
                  <li
                    key={t.id}
                    className="px-5 py-3 flex items-center justify-between hover:bg-slate-50"
                  >
                    <Link
                      to={`/tasks/${t.id}`}
                      className="text-sm font-medium text-slate-700 hover:text-blue-600 truncate max-w-xs"
                    >
                      {t.title}
                    </Link>
                    <span
                      className={`ml-3 shrink-0 px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[t.status] ?? "bg-slate-100 text-slate-600"}`}
                    >
                      {t.status === "InProgress" ? "In Progress" : t.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col gap-1">
      <div className={`w-8 h-1 rounded-full ${color} mb-1`} />
      <div className="text-2xl font-bold text-slate-800">{value}</div>
      <div className="text-xs text-slate-500 font-medium">{label}</div>
    </div>
  );
}
