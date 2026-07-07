import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Sparkles, Mail, Lock, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill out all fields.");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      await login(email, password);
      toast.success("Welcome back to ApplyMate!");
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Login failed:", err);
      setError(err.message || "Invalid credentials. Please verify your email and password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Glow Element */}
        <div className="absolute -top-10 -right-10 h-32 w-32 bg-blue-500/10 rounded-full blur-2xl" />

        <div className="flex flex-col items-center text-center space-y-2 mb-8">
          <div className="h-11 w-11 rounded-lg bg-blue-600 dark:bg-blue-50 flex items-center justify-center text-white dark:text-blue-600 shadow-md">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-gray-950 dark:text-white">
            Welcome Back
          </h2>
          <p className="text-xs text-gray-400">
            Log in to audit and optimize your resumes with Gemini AI
          </p>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="mb-5 p-3 rounded-lg border border-rose-100 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/20 text-xs text-rose-600 dark:text-rose-400 flex items-start gap-2 animate-fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Email */}
          <div className="space-y-1">
            <label className="block text-gray-400 font-semibold uppercase">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-150 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-gray-400 font-semibold uppercase">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-150 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-6 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Toggle */}
        <div className="mt-8 pt-4 border-t border-gray-50 dark:border-gray-800 text-center text-xs text-gray-400">
          New to ApplyMate?{" "}
          <Link
            to="/register"
            className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
