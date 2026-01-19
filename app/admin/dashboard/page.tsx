"use client";

import { useEffect, useState } from "react";

export default function AdminDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeMemberships: 0,
    classesThisWeek: 0,
    averageAttendance: 0,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          window.location.href = "/auth/login";
          return;
        }

        const response = await fetch("/api/admin/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            window.location.href = "/auth/login";
            return;
          }
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        const data = await response.json();
        setStats({
          totalCustomers: data.totalCustomers || 0,
          activeMemberships: data.activeMemberships || 0,
          classesThisWeek: data.classesThisWeek || 0,
          averageAttendance: data.averageAttendance || 0,
        });
        setError(null);
      } catch (err: any) {
        console.error("Error:", err);
        setError(err.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [mounted]);

  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-neutral-600">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h2 className="text-xl font-bold text-primary mb-4">Error</h2>
          <p className="text-neutral-600 mb-4">{error}</p>
          <div className="space-y-2">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
            >
              Reload Page
            </button>
            <button
              onClick={() => {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                window.location.href = "/auth/login";
              }}
              className="w-full px-4 py-2 bg-neutral-200 text-neutral-900 rounded-lg hover:bg-neutral-300"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-primary">Admin Dashboard</h1>
            <button
              onClick={() => {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                window.location.href = "/auth/login";
              }}
              className="text-neutral-600 hover:text-neutral-900 text-sm"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8 h-16 items-center">
            <a href="/admin/dashboard" className="text-sm font-medium text-primary">
              Dashboard
            </a>
            <a href="/admin/customers" className="text-sm font-medium text-neutral-600 hover:text-neutral-900">
              Customers
            </a>
            <a href="/admin/classes" className="text-sm font-medium text-neutral-600 hover:text-neutral-900">
              Classes
            </a>
            <a href="/admin/leaderboard" className="text-sm font-medium text-neutral-600 hover:text-neutral-900">
              Leaderboard
            </a>
            <a href="/admin/reports" className="text-sm font-medium text-neutral-600 hover:text-neutral-900">
              Reports
            </a>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-neutral-600 mb-2">
              Total Customers
            </h3>
            <div className="text-4xl font-bold text-primary">
              {stats.totalCustomers}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-neutral-600 mb-2">
              Active Memberships
            </h3>
            <div className="text-4xl font-bold text-primary">
              {stats.activeMemberships}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-neutral-600 mb-2">
              Classes This Week
            </h3>
            <div className="text-4xl font-bold text-primary">
              {stats.classesThisWeek}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-neutral-600 mb-2">
              Avg Attendance
            </h3>
            <div className="text-4xl font-bold text-primary">
              {stats.averageAttendance}%
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-primary mb-4">
              Customer Management
            </h2>
            <p className="text-neutral-600 mb-4">
              View and manage all customers, their memberships, and activity.
            </p>
            <a
              href="/admin/customers"
              className="text-accent hover:text-accent-dark font-medium"
            >
              Manage Customers →
            </a>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-primary mb-4">
              Class Management
            </h2>
            <p className="text-neutral-600 mb-4">
              Create and manage classes, schedules, and class instances.
            </p>
            <a
              href="/admin/classes"
              className="text-accent hover:text-accent-dark font-medium"
            >
              Manage Classes →
            </a>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-primary mb-4">
              Leaderboard
            </h2>
            <p className="text-neutral-600 mb-4">
              View top customers by attendance and engagement.
            </p>
            <a
              href="/admin/leaderboard"
              className="text-accent hover:text-accent-dark font-medium"
            >
              View Leaderboard →
            </a>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-primary mb-4">
              Progress Reports
            </h2>
            <p className="text-neutral-600 mb-4">
              Create and track progress reports for customers.
            </p>
            <a
              href="/admin/reports"
              className="text-accent hover:text-accent-dark font-medium"
            >
              Manage Reports →
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
