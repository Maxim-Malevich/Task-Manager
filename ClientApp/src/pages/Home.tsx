import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="py-16 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-6 text-3xl">
        
      </div>
      <h1 className="text-4xl font-bold text-slate-800 mb-3">Task Manager</h1>
      <p className="text-slate-500 text-lg max-w-md mx-auto mb-8">
        Organize your work, track progress, and get things done.
      </p>

      {isAuthenticated ? (
        <Link
          to="/dashboard"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-sm"
        >
          Go to Dashboard
        </Link>
      ) : (
        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            to="/login"
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-sm"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 transition-colors shadow-sm"
          >
            Create Account
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mt-16 text-left">
        {[
          { icon: "", title: "Track Tasks", desc: "Create, update, and complete tasks effortlessly." },
          { icon: "", title: "Stay Organized", desc: "See pending and in-progress tasks at a glance." },
          { icon: "", title: "Secure Access", desc: "JWT-based authentication keeps your data safe." },
        ].map(({ icon, title, desc }) => (
          <div key={title} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="text-2xl mb-2">{icon}</div>
            <h3 className="font-semibold text-slate-800 text-sm mb-1">{title}</h3>
            <p className="text-xs text-slate-500">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
