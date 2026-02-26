import { Link, useLocation } from "react-router-dom";

export default function NotFound() {
  const location = useLocation();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="text-8xl font-black text-slate-200 select-none mb-2">404</div>
      <h2 className="text-2xl font-bold text-slate-700 mb-2">Page not found</h2>
      <p className="text-slate-500 text-sm mb-1">
        The page{" "}
        <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 text-xs">
          {location.pathname}
        </code>{" "}
        does not exist.
      </p>
      <p className="text-slate-400 text-sm mb-8">It may have been moved or deleted.</p>
      <Link
        to="/"
        className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}
