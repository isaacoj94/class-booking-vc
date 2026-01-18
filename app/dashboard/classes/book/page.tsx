"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Class {
  id: string;
  name: string;
  instructorName: string;
  priceCredits: number;
  durationMinutes: number;
}

interface ClassInstance {
  id: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  class: Class;
  spotsRemaining: number;
}

export default function BookClassPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<Class[]>([]);
  const [instances, setInstances] = useState<ClassInstance[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    fetchClasses();
  }, [router]);

  useEffect(() => {
    if (selectedClassId) {
      fetchInstances(selectedClassId);
    }
  }, [selectedClassId]);

  const fetchClasses = async () => {
    try {
      const response = await fetch("/api/classes?available=true");
      const data = await response.json();
      setClasses(data);
      if (data.length > 0 && !selectedClassId) {
        setSelectedClassId(data[0].id);
      }
    } catch (err) {
      console.error("Error fetching classes:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInstances = async (classId: string) => {
    try {
      const startDate = new Date().toISOString();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30); // Next 30 days

      const response = await fetch(
        `/api/class-instances?classId=${classId}&startDate=${startDate}&endDate=${endDate.toISOString()}&available=true`
      );
      const data = await response.json();
      setInstances(data);
    } catch (err) {
      console.error("Error fetching instances:", err);
    }
  };

  const handleBook = async (instanceId: string) => {
    setBooking(true);
    setError("");

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ classInstanceId: instanceId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Booking failed");
      }

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBooking(false);
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
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-neutral-600 hover:text-neutral-900">
              ← Back
            </Link>
            <h1 className="font-heading text-2xl font-bold text-primary">
              Book a Class
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded text-error">
            {error}
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Select Class
          </label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full md:w-auto px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name} - {cls.instructorName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <h2 className="font-heading text-xl font-bold text-primary mb-4">
            Available Sessions
          </h2>

          {instances.length === 0 ? (
            <div className="bg-white rounded-lg shadow-card p-12 text-center">
              <p className="text-neutral-600 mb-4">No available sessions</p>
              <p className="text-sm text-neutral-500">
                Check back later or select a different class.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {instances.map((instance) => (
                <div
                  key={instance.id}
                  className="bg-white rounded-lg shadow-card p-6"
                >
                  <h3 className="font-semibold text-primary mb-2">
                    {instance.class.name}
                  </h3>
                  <p className="text-sm text-neutral-600 mb-2">
                    {instance.class.instructorName}
                  </p>
                  <p className="text-sm text-neutral-700 mb-2">
                    {new Date(instance.scheduledStartTime).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-sm text-neutral-700 mb-4">
                    {new Date(instance.scheduledStartTime).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}{" "}
                    -{" "}
                    {new Date(instance.scheduledEndTime).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-neutral-600">
                      {instance.class.priceCredits} credit
                      {instance.class.priceCredits !== 1 ? "s" : ""}
                    </span>
                    <span className="text-sm text-neutral-600">
                      {instance.spotsRemaining} spot
                      {instance.spotsRemaining !== 1 ? "s" : ""} left
                    </span>
                  </div>
                  <button
                    onClick={() => handleBook(instance.id)}
                    disabled={booking || instance.spotsRemaining === 0}
                    className="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {booking ? "Booking..." : "Book Now"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
