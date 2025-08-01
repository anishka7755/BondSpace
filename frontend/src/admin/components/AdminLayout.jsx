import React from "react";
import { Link, NavLink } from "react-router-dom";
import { Home, Users, Key, Layers, Shield, LogOut } from "lucide-react";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-rose-100 via-lavender-50 to-white dark:from-rose-950 dark:via-gray-900 dark:to-black p-6 border-r border-rose-200 dark:border-gray-900 flex flex-col">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-9 h-9 bg-gradient-to-r from-rose-500 to-lavender-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow">
            RM
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-rose-600 to-lavender-600 dark:from-rose-400 dark:to-lavender-400 bg-clip-text text-transparent">
            Admin
          </span>
        </div>
        <nav className="flex-1 space-y-2">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) => navClass(isActive)}
          >
            <Home className="w-5 h-5 mr-2" /> Dashboard
          </NavLink>
          <NavLink
            to="/admin/users"
            className={({ isActive }) => navClass(isActive)}
          >
            <Users className="w-5 h-5 mr-2" /> Users
          </NavLink>
          <NavLink
            to="/admin/rooms"
            className={({ isActive }) => navClass(isActive)}
          >
            <Key className="w-5 h-5 mr-2" /> Rooms
          </NavLink>
          <NavLink
            to="/admin/matches"
            className={({ isActive }) => navClass(isActive)}
          >
            <Layers className="w-5 h-5 mr-2" /> Matches
          </NavLink>
          <NavLink
            to="/admin/audit"
            className={({ isActive }) => navClass(isActive)}
          >
            <Shield className="w-5 h-5 mr-2" /> Audit Log
          </NavLink>
        </nav>
        <div className="mt-8">
          <button
            className="w-full flex items-center justify-center space-x-2 text-sm text-gray-700 dark:text-gray-300 px-3 py-2 rounded hover:bg-rose-100 dark:hover:bg-rose-900/50 transition"
            onClick={() => {
              localStorage.clear();
              window.location.href = "/admin/login";
            }}
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>
      {/* Main Panel */}
      <main className="flex-1 bg-white dark:bg-black min-h-screen p-6">
        {children}
      </main>
    </div>
  );
}
function navClass(isActive) {
  return `flex items-center px-4 py-2 rounded transition font-medium ${
    isActive
      ? "bg-gradient-to-r from-rose-500 to-lavender-500 text-white shadow"
      : "text-gray-700 dark:text-gray-200 hover:bg-rose-100 dark:hover:bg-rose-900/30"
  }`;
}
