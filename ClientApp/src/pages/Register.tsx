import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { register as registerApi } from "../api/authService";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HAS_LETTER = /[a-zA-Z]/;
const HAS_NUMBER = /[0-9]/;

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [touched, setTouched] = useState({ email: false, password: false, confirm: false });
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const emailError = touched.email && !EMAIL_RE.test(email) ? "Enter a valid email address." : "";

  const passwordErrors: string[] = [];
  if (touched.password) {
    if (password.length < 8) passwordErrors.push("At least 8 characters");
    if (!HAS_LETTER.test(password)) passwordErrors.push("At least one letter");
    if (!HAS_NUMBER.test(password)) passwordErrors.push("At least one number");
  }

  const confirmError = touched.confirm && confirm !== password ? "Passwords do not match." : "";

  const isValid =
    EMAIL_RE.test(email) &&
    password.length >= 8 &&
    HAS_LETTER.test(password) &&
    HAS_NUMBER.test(password) &&
    confirm === password;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setTouched({ email: true, password: true, confirm: true });
    if (!isValid) return;
    setServerError("");
    setLoading(true);
    try {
      const data = await registerApi(email, password);
      login(data.token, { email: data.email, role: data.role });
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setServerError("An account with that email already exists.");
      } else {
        setServerError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-1">Create account</h2>
          <p className="text-slate-500 text-sm mb-6">Start managing your tasks today</p>

          {serverError && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                placeholder="you@example.com"
                className={`w-full px-3 py-2 border rounded-lg text-sm outline-none transition-colors ${emailError ? "border-red-400 focus:ring-2 focus:ring-red-200" : "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"}`}
              />
              {emailError && <p className="mt-1 text-xs text-red-600">{emailError}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                placeholder="Min. 8 chars with letters & numbers"
                className={`w-full px-3 py-2 border rounded-lg text-sm outline-none transition-colors ${passwordErrors.length > 0 ? "border-red-400 focus:ring-2 focus:ring-red-200" : "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"}`}
              />
              {passwordErrors.length > 0 && (
                <ul className="mt-1 space-y-0.5">
                  {passwordErrors.map((err) => (
                    <li key={err} className="text-xs text-red-600">&bull; {err}</li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Confirm password</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
                placeholder="Re-enter your password"
                className={`w-full px-3 py-2 border rounded-lg text-sm outline-none transition-colors ${confirmError ? "border-red-400 focus:ring-2 focus:ring-red-200" : "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"}`}
              />
              {confirmError && <p className="mt-1 text-xs text-red-600">{confirmError}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-emerald-600 text-white rounded-lg font-semibold text-sm hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
