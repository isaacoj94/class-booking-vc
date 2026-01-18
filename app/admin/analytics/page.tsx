"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface AnalyticsData {
  bookingsByDay: Array<{ day: string; count: number }>;
  bookingsByClass: Array<{ className: string; count: number }>;
  attendanceRate: number;
  membershipDistribution: Array<{ type: string; count: number }>;
  monthlyTrends: Array<{ month: string; bookings: number; attendance: number }>;
}

const COLORS = ['#1a1a2e', '#FF6B6B', '#00b894', '#fdcb6e', '#d63031'];

export default function AnalyticsPage() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    fetchAnalytics();
  }, [router]);

  const fetchAnalytics = async () => {
    try {
      // For now, generate mock data - in production, this would come from API
      // TODO: Create /api/admin/analytics endpoint
      const mockData: AnalyticsData = {
        bookingsByDay: [
          { day: "Mon", count: 12 },
          { day: "Tue", count: 15 },
          { day: "Wed", count: 18 },
          { day: "Thu", count: 14 },
          { day: "Fri", count: 10 },
          { day: "Sat", count: 20 },
          { day: "Sun", count: 8 },
        ],
        bookingsByClass: [
          { className: "Beginner Ballet", count: 45 },
          { className: "Intermediate Pointe", count: 32 },
          { className: "Advanced Ballet", count: 28 },
          { className: "Barre Class", count: 20 },
        ],
        attendanceRate: 85,
        membershipDistribution: [
          { type: "Monthly", count: 65 },
          { type: "Annual", count: 25 },
          { type: "Pay-as-you-go", count: 10 },
        ],
        monthlyTrends: [
          { month: "Jan", bookings: 120, attendance: 102 },
          { month: "Feb", bookings: 135, attendance: 118 },
          { month: "Mar", bookings: 150, attendance: 132 },
          { month: "Apr", bookings: 145, attendance: 128 },
        ],
      };

      setAnalytics(mockData);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-neutral-600">Loading analytics...</div>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="text-neutral-600 hover:text-neutral-900">
              ← Back
            </Link>
            <h1 className="font-heading text-2xl font-bold text-primary">Analytics</h1>
          </div>
        </div>
      </header>

      <Navigation role="admin" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Bookings by Day */}
        <div className="bg-white rounded-lg shadow-card p-6">
          <h2 className="font-heading text-xl font-bold text-primary mb-6">
            Bookings by Day of Week
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.bookingsByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#1a1a2e" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Popular Classes */}
        <div className="bg-white rounded-lg shadow-card p-6">
          <h2 className="font-heading text-xl font-bold text-primary mb-6">
            Most Popular Classes
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.bookingsByClass} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="className" type="category" width={150} />
              <Tooltip />
              <Bar dataKey="count" fill="#FF6B6B" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Membership Distribution */}
        <div className="bg-white rounded-lg shadow-card p-6">
          <h2 className="font-heading text-xl font-bold text-primary mb-6">
            Membership Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.membershipDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {analytics.membershipDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Trends */}
        <div className="bg-white rounded-lg shadow-card p-6">
          <h2 className="font-heading text-xl font-bold text-primary mb-6">
            Monthly Trends
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="bookings" fill="#1a1a2e" name="Bookings" />
              <Bar dataKey="attendance" fill="#00b894" name="Attendance" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-card p-6">
            <h3 className="text-sm font-medium text-neutral-600 mb-2">Overall Attendance Rate</h3>
            <div className="text-4xl font-bold text-primary">{analytics.attendanceRate}%</div>
          </div>
          <div className="bg-white rounded-lg shadow-card p-6">
            <h3 className="text-sm font-medium text-neutral-600 mb-2">Total Bookings</h3>
            <div className="text-4xl font-bold text-primary">
              {analytics.monthlyTrends.reduce((sum, m) => sum + m.bookings, 0)}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-card p-6">
            <h3 className="text-sm font-medium text-neutral-600 mb-2">Total Attendance</h3>
            <div className="text-4xl font-bold text-primary">
              {analytics.monthlyTrends.reduce((sum, m) => sum + m.attendance, 0)}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
