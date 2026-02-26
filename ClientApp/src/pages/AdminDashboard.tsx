import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Admin Dashboard</h2>
        <p className="text-slate-500 text-sm mt-1">
          Logged in as <span className="font-medium">{user?.email}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to="/admin/users"
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:border-violet-300 hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center mb-3">
            <span className="text-xl"></span>
          </div>
          <h3 className="font-semibold text-slate-800 mb-1 group-hover:text-violet-700">Users</h3>
          <p className="text-sm text-slate-500">Manage all registered users.</p>
          <p className="text-xs text-violet-600 mt-3 font-medium">View Users </p>
        </Link>

        <Link
          to="/tasks"
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:border-blue-300 hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
            <span className="text-xl"></span>
          </div>
          <h3 className="font-semibold text-slate-800 mb-1 group-hover:text-blue-700">Tasks</h3>
          <p className="text-sm text-slate-500">View and manage all tasks.</p>
          <p className="text-xs text-blue-600 mt-3 font-medium">View Tasks </p>
        </Link>
      </div>
    </div>
  );
}
