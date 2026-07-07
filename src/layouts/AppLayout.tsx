import React from "react";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Sun, Moon, LogOut, FileText, History as HistoryIcon, LayoutDashboard, Sparkles } from "lucide-react";

export const AppLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Get user initials for avatar
  const getInitials = () => {
    if (!user || !user.name) return "AM";
    return user.name
      .split(" ")
      .map((n: string) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col transition-colors duration-200">
      {/* 1. Header Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="h-9 w-9 rounded-lg bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              ApplyMate
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <Link
              to="/dashboard"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md transition-colors ${
                isActive("/dashboard")
                  ? "text-blue-600 bg-blue-50/50 dark:text-blue-400 dark:bg-blue-950/20"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              to="/history"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md transition-colors ${
                isActive("/history")
                  ? "text-blue-600 bg-blue-50/50 dark:text-blue-400 dark:bg-blue-950/20"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              <HistoryIcon className="h-4 w-4" />
              History Log
            </Link>
          </nav>

          {/* Settings & Avatar */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all cursor-pointer"
              title="Toggle theme mode"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* User Profile Card */}
            {user && (
              <div className="flex items-center gap-2.5 pl-2 border-l border-gray-100 dark:border-gray-800">
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-bold text-gray-900 dark:text-white">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500">
                    {user.email}
                  </p>
                </div>
                <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold text-sm border border-blue-200/40 dark:border-blue-800/40 select-none">
                  {getInitials()}
                </div>
              </div>
            )}

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
              title="Log out of system"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Mobile Nav Links */}
        <div className="md:hidden flex items-center justify-around h-11 border-t border-gray-50 dark:border-gray-800/60 bg-gray-50/30 dark:bg-gray-950/20 text-xs font-medium">
          <Link
            to="/dashboard"
            className={`flex items-center gap-1 ${
              isActive("/dashboard") ? "text-blue-600 dark:text-blue-400" : "text-gray-400"
            }`}
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            Dashboard
          </Link>
          <Link
            to="/history"
            className={`flex items-center gap-1 ${
              isActive("/history") ? "text-blue-600 dark:text-blue-400" : "text-gray-400"
            }`}
          >
            <HistoryIcon className="h-3.5 w-3.5" />
            History Log
          </Link>
        </div>
      </header>

      {/* 2. Main content container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
