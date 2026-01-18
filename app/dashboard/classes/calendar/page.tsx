"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from "date-fns";

interface ClassInstance {
  id: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  class: {
    name: string;
    instructorName: string;
    priceCredits: number;
  };
  spotsRemaining: number;
}

export default function CalendarPage() {
  const router = useRouter();
  const [instances, setInstances] = useState<ClassInstance[]>([]);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    fetchInstances();
  }, [router, currentWeek]);

  const fetchInstances = async () => {
    try {
      const weekStart = startOfWeek(currentWeek);
      const weekEnd = endOfWeek(currentWeek);

      const response = await fetch(
        `/api/class-instances?startDate=${weekStart.toISOString()}&endDate=${weekEnd.toISOString()}&available=true`
      );
      const data = await response.json();
      setInstances(data);
    } catch (err) {
      console.error("Error fetching instances:", err);
    } finally {
      setLoading(false);
    }
  };

  const weekStart = startOfWeek(currentWeek);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    return day;
  });

  const getInstancesForDay = (day: Date) => {
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);

    return instances.filter((instance) => {
      const instanceDate = new Date(instance.scheduledStartTime);
      return instanceDate >= dayStart && instanceDate <= dayEnd;
    });
  };

  const navigateWeek = (direction: "prev" | "next") => {
    setCurrentWeek((prev) => (direction === "next" ? addWeeks(prev, 1) : subWeeks(prev, 1)));
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
            <Link href="/dashboard" className="text-neutral-600 hover:text-neutral-900">
              ← Back
            </Link>
            <h1 className="font-heading text-2xl font-bold text-primary">
              Class Calendar
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Week Navigation */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigateWeek("prev")}
            className="px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50"
          >
            ← Previous Week
          </button>
          <h2 className="font-heading text-xl font-semibold text-primary">
            {format(weekStart, "MMMM d")} - {format(endOfWeek(currentWeek), "MMMM d, yyyy")}
          </h2>
          <button
            onClick={() => navigateWeek("next")}
            className="px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50"
          >
            Next Week →
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-lg shadow-card overflow-hidden">
          <div className="grid grid-cols-7 gap-px border-b border-neutral-200">
            {weekDays.map((day) => (
              <div
                key={day.toISOString()}
                className="bg-neutral-50 p-3 text-center border-b border-neutral-200"
              >
                <div className="text-sm font-medium text-neutral-600">
                  {format(day, "EEE")}
                </div>
                <div className="text-lg font-semibold text-primary mt-1">
                  {format(day, "d")}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-px">
            {weekDays.map((day) => {
              const dayInstances = getInstancesForDay(day);
              return (
                <div
                  key={day.toISOString()}
                  className="min-h-[200px] p-3 bg-white border-r border-neutral-200 last:border-r-0"
                >
                  {dayInstances.length === 0 ? (
                    <p className="text-xs text-neutral-400 text-center mt-8">
                      No classes
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {dayInstances.map((instance) => (
                        <div
                          key={instance.id}
                          className="p-2 bg-accent/10 rounded border border-accent/20 cursor-pointer hover:bg-accent/20 transition-colors"
                          onClick={() => router.push(`/dashboard/classes/book`)}
                        >
                          <div className="text-xs font-semibold text-primary">
                            {instance.class.name}
                          </div>
                          <div className="text-xs text-neutral-600 mt-1">
                            {format(
                              new Date(instance.scheduledStartTime),
                              "h:mm a"
                            )}
                          </div>
                          <div className="text-xs text-neutral-500 mt-1">
                            {instance.spotsRemaining} spots
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
