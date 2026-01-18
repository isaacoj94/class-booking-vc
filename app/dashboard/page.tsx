"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AIClassRecommendations from "./components/AIClassRecommendations";
import NotificationsCenter from "@/components/NotificationsCenter";
import Navigation from "@/components/Navigation";

interface CustomerData {
  creditsRemaining: number;
  renewalDate: string | null;
  consecutiveWeeksStreak: number;
  totalClassesAttended: number;
  upcomingClasses: any[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    fetchCustomerData();
  }, [router]);

  const fetchCustomerData = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/customers/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const data = await response.json();
      setCustomerData(data);
      setUser(data.user);
    } catch (error) {
      console.error("Error fetching customer data:", error);
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

  if (!customerData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="font-heading text-2xl font-bold text-primary">
              Ballet Studio
            </h1>
            <div className="flex items-center gap-4">
              <NotificationsCenter />
              <Link
                href="/dashboard/settings"
                className="text-neutral-700 hover:text-neutral-900 font-medium"
              >
                {user?.firstName} {user?.lastName}
              </Link>
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

      <Navigation role="customer" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Row */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Credits Card */}
          <div className="bg-white rounded-lg shadow-card p-6">
            <h3 className="text-sm font-medium text-neutral-600 mb-2">
              Remaining Credits
            </h3>
            <div className="text-4xl font-bold text-primary mb-2">
              {customerData.creditsRemaining}
            </div>
            {customerData.renewalDate && (
              <p className="text-sm text-neutral-500">
                Renewal: {new Date(customerData.renewalDate).toLocaleDateString()}
              </p>
            )}
          </div>

          {/* Streak Card */}
          <div className="bg-white rounded-lg shadow-card p-6">
            <h3 className="text-sm font-medium text-neutral-600 mb-2">
              Current Streak
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-4xl">🔥</span>
              <div>
                <div className="text-4xl font-bold text-primary">
                  {customerData.consecutiveWeeksStreak}
                </div>
                <p className="text-sm text-neutral-500">weeks in a row</p>
              </div>
            </div>
          </div>

          {/* Total Classes Card */}
          <div className="bg-white rounded-lg shadow-card p-6">
            <h3 className="text-sm font-medium text-neutral-600 mb-2">
              Total Classes
            </h3>
            <div className="text-4xl font-bold text-primary">
              {customerData.totalClassesAttended}
            </div>
            <p className="text-sm text-neutral-500 mt-2">All time</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="font-heading text-2xl font-bold text-primary mb-4">
            Quick Actions
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              href="/dashboard/classes/book"
              className="bg-primary text-white p-6 rounded-lg hover:bg-primary-light transition-colors text-center font-semibold"
            >
              Book a Class
            </Link>
            <Link
              href="/dashboard/classes/calendar"
              className="bg-white border-2 border-primary text-primary p-6 rounded-lg hover:bg-neutral-50 transition-colors text-center font-semibold"
            >
              View Calendar
            </Link>
            <Link
              href="/dashboard/progress"
              className="bg-white border-2 border-primary text-primary p-6 rounded-lg hover:bg-neutral-50 transition-colors text-center font-semibold"
            >
              My Progress
            </Link>
          </div>
        </div>

        {/* AI Recommendations */}
        <AIClassRecommendations />

        {/* Upcoming Classes */}
        <div>
          <h2 className="font-heading text-2xl font-bold text-primary mb-4">
            Upcoming Classes
          </h2>
          {customerData.upcomingClasses && customerData.upcomingClasses.length > 0 ? (
            <div className="bg-white rounded-lg shadow-card p-6">
              <div className="space-y-4">
                {customerData.upcomingClasses.map((booking: any) => (
                  <div
                    key={booking.id}
                    className="flex justify-between items-center py-3 border-b border-neutral-200 last:border-0"
                  >
                    <div>
                      <h3 className="font-semibold text-primary">
                        {booking.classInstance?.class?.name || "Class"}
                      </h3>
                      <p className="text-sm text-neutral-600">
                        {new Date(
                          booking.classInstance?.scheduledStartTime
                        ).toLocaleString()}
                      </p>
                    </div>
                    <span className="text-sm text-neutral-500">
                      {booking.bookingStatus}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-card p-12 text-center">
              <p className="text-neutral-600 mb-4">No upcoming classes</p>
              <Link
                href="/dashboard/classes/book"
                className="text-accent hover:text-accent-dark font-medium"
              >
                Book your first class →
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
