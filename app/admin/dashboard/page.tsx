"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NotificationsCenter from "@/components/NotificationsCenter";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeMemberships: 0,
    classesThisWeek: 0,
    averageAttendance: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    // Fetch admin stats
    fetchAdminStats();
  }, [router]);

  const fetchAdminStats = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/admin/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch stats");
      }

      setStats({
        totalCustomers: data.totalCustomers || 0,
        activeMemberships: data.activeMemberships || 0,
        classesThisWeek: data.classesThisWeek || 0,
        averageAttendance: data.averageAttendance || 0,
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      // Keep default stats on error
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-neutral-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="font-heading text-2xl font-bold text-primary">
              Admin Dashboard
            </h1>
            <div className="flex items-center gap-4">
              <NotificationsCenter />
              <button
                onClick={() => {
                  localStorage.removeItem("accessToken");
                  localStorage.removeItem("refreshToken");
                  router.push("/auth/login");
                }}
                className="text-neutral-600 hover:text-neutral-900 text-sm"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      <Navigation role="admin" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Row */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-card p-6">
            <h3 className="text-sm font-medium text-neutral-600 mb-2">
              Total Customers
            </h3>
            <div className="text-4xl font-bold text-primary">
              {stats.totalCustomers}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-card p-6">
            <h3 className="text-sm font-medium text-neutral-600 mb-2">
              Active Memberships
            </h3>
            <div className="text-4xl font-bold text-primary">
              {stats.activeMemberships}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-card p-6">
            <h3 className="text-sm font-medium text-neutral-600 mb-2">
              Classes This Week
            </h3>
            <div className="text-4xl font-bold text-primary">
              {stats.classesThisWeek}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-card p-6">
            <h3 className="text-sm font-medium text-neutral-600 mb-2">
              Avg Attendance
            </h3>
            <div className="text-4xl font-bold text-primary">
              {stats.averageAttendance}%
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-card p-6">
            <h2 className="font-heading text-xl font-bold text-primary mb-4">
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

          <div className="bg-white rounded-lg shadow-card p-6">
            <h2 className="font-heading text-xl font-bold text-primary mb-4">
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

          <div className="bg-white rounded-lg shadow-card p-6">
            <h2 className="font-heading text-xl font-bold text-primary mb-4">
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

          <div className="bg-white rounded-lg shadow-card p-6">
            <h2 className="font-heading text-xl font-bold text-primary mb-4">
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

          <div className="bg-white rounded-lg shadow-card p-6">
            <h2 className="font-heading text-xl font-bold text-primary mb-4">
              Analytics
            </h2>
            <p className="text-neutral-600 mb-4">
              View detailed analytics and insights about your studio.
            </p>
            <a
              href="/admin/analytics"
              className="text-accent hover:text-accent-dark font-medium"
            >
              View Analytics →
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
