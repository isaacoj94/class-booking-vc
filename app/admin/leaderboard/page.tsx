"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface LeaderboardCustomer {
  id: string;
  totalClassesAttended: number;
  consecutiveWeeksStreak: number;
  attendanceRate?: number;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function LeaderboardPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<LeaderboardCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState<"classes" | "streak" | "attendance">("classes");

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    fetchLeaderboard();
  }, [router, type]);

  const fetchLeaderboard = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/admin/leaderboard?type=${type}&limit=10`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      setCustomers(data.customers);
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  const getDisplayValue = (customer: LeaderboardCustomer) => {
    if (type === "classes") return customer.totalClassesAttended;
    if (type === "streak") return `${customer.consecutiveWeeksStreak} weeks`;
    if (type === "attendance") return `${customer.attendanceRate}%`;
    return 0;
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
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="text-neutral-600 hover:text-neutral-900">
              ← Back
            </Link>
            <h1 className="font-heading text-2xl font-bold text-primary">
              Leaderboard
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Type Selector */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setType("classes")}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              type === "classes"
                ? "bg-primary text-white"
                : "bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
            }`}
          >
            Most Classes
          </button>
          <button
            onClick={() => setType("streak")}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              type === "streak"
                ? "bg-primary text-white"
                : "bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
            }`}
          >
            Longest Streak
          </button>
          <button
            onClick={() => setType("attendance")}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              type === "attendance"
                ? "bg-primary text-white"
                : "bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
            }`}
          >
            Attendance Rate
          </button>
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-lg shadow-card overflow-hidden">
          <div className="divide-y divide-neutral-200">
            {customers.map((customer, index) => (
              <div
                key={customer.id}
                className={`p-6 flex items-center justify-between ${
                  index < 3 ? "bg-accent/5" : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-primary w-12 text-center">
                    {getRankIcon(index + 1)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary text-lg">
                      {customer.user.firstName} {customer.user.lastName}
                    </h3>
                    <p className="text-sm text-neutral-600">{customer.user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">
                    {getDisplayValue(customer)}
                  </div>
                  <p className="text-sm text-neutral-500 mt-1">
                    {type === "classes" && "classes attended"}
                    {type === "streak" && "consecutive weeks"}
                    {type === "attendance" && "attendance rate"}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {customers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-neutral-600">No data available</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
