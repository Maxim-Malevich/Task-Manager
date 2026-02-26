import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="max-w-sm">
      <h2 className="text-xl font-bold text-slate-800 mb-4">Profile</h2>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-700 text-2xl font-bold mx-auto mb-2">
          {user?.email?.[0]?.toUpperCase() ?? "?"}
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Email</label>
          <p className="text-slate-800 font-medium text-sm">{user?.email}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Role</label>
          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${user?.role === "Admin" ? "bg-violet-100 text-violet-800" : "bg-blue-100 text-blue-800"}`}>
            {user?.role}
          </span>
        </div>
      </div>
    </div>
  );
}
