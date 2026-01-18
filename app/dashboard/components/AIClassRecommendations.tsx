"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Recommendation {
  class: string;
  reason: string;
}

interface ClassInstance {
  id: string;
  className: string;
  instructorName: string;
  scheduledStartTime: string;
  priceCredits: number;
}

export default function AIClassRecommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [availableClasses, setAvailableClasses] = useState<ClassInstance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/ai/recommendations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      setRecommendations(data.recommendations || []);
      setAvailableClasses(data.availableClasses || []);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || recommendations.length === 0) {
    return null; // Don't show if no recommendations
  }

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">✨</span>
        <h2 className="font-heading text-2xl font-bold text-primary">AI Recommendations</h2>
      </div>
      <div className="bg-white rounded-lg shadow-card p-6">
        <p className="text-sm text-neutral-600 mb-4">
          Based on your class history and preferences, we think you might enjoy:
        </p>
        <div className="space-y-3">
          {recommendations.map((rec, index) => {
            const matchingClass = availableClasses.find((c) => c.className === rec.class);
            return (
              <div
                key={index}
                className="p-4 bg-accent/5 rounded-lg border border-accent/20 hover:bg-accent/10 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-primary mb-1">{rec.class}</h3>
                    <p className="text-sm text-neutral-600">{rec.reason}</p>
                    {matchingClass && (
                      <p className="text-xs text-neutral-500 mt-2">
                        Next session: {new Date(matchingClass.scheduledStartTime).toLocaleDateString()} at{" "}
                        {new Date(matchingClass.scheduledStartTime).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4">
          <Link
            href="/dashboard/classes/book"
            className="text-accent hover:text-accent-dark font-medium text-sm"
          >
            View all available classes →
          </Link>
        </div>
      </div>
    </div>
  );
}
