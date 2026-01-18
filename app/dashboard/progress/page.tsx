"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function ProgressReportsSection() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/admin/progress-reports", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      setReports(data);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-card p-6">
        <p className="text-neutral-600">Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-card p-6">
      {reports.length === 0 ? (
        <p className="text-neutral-600 text-center py-8">
          No progress reports yet. Your teacher will share updates with you here!
        </p>
      ) : (
        <div className="space-y-4">
          {reports.map((report: any) => (
            <div
              key={report.id}
              className="p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-primary">{report.title}</h3>
                <span className="text-xs text-neutral-500">
                  {new Date(report.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-neutral-600 mb-3">{report.content}</p>
              {report.goals && report.goals.length > 0 && (
                <div className="mt-3 pt-3 border-t border-neutral-200">
                  <h4 className="text-xs font-semibold text-neutral-700 mb-2">Goals:</h4>
                  <ul className="space-y-1">
                    {report.goals.map((goal: any, idx: number) => (
                      <li key={idx} className="text-sm text-neutral-600">
                        • {goal.goal} {goal.targetDate && `(Target: ${new Date(goal.targetDate).toLocaleDateString()})`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {report.aiAnalysis && (
                <div className="mt-3 pt-3 border-t border-neutral-200">
                  <h4 className="text-xs font-semibold text-neutral-700 mb-2">Progress Analysis:</h4>
                  <p className="text-sm text-neutral-600">{report.aiAnalysis.analysis || "Analysis unavailable"}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface Checkpoint {
  id: string;
  checkpointType: string;
  achievedAt: string;
  classCountAtAchievement: number;
}

interface ProgressData {
  totalClassesAttended: number;
  consecutiveWeeksStreak: number;
  checkpoints: Checkpoint[];
}

export default function ProgressPage() {
  const router = useRouter();
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    fetchProgress();
  }, [router]);

  const fetchProgress = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/customers/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      setProgress({
        totalClassesAttended: data.totalClassesAttended || 0,
        consecutiveWeeksStreak: data.consecutiveWeeksStreak || 0,
        checkpoints: data.checkpoints || [],
      });
    } catch (error) {
      console.error("Error fetching progress:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCheckpointLabel = (type: string) => {
    const labels: Record<string, string> = {
      FIRST_CLASS: "First Class",
      THIRD_CLASS: "3 Classes",
      TENTH_CLASS: "10 Classes",
      MONTH_STREAK: "Month Streak",
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-neutral-600">Loading...</div>
      </div>
    );
  }

  if (!progress) {
    return null;
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
              My Progress
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-card p-6">
            <h3 className="text-sm font-medium text-neutral-600 mb-2">
              Total Classes Attended
            </h3>
            <div className="text-4xl font-bold text-primary">
              {progress.totalClassesAttended}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-card p-6">
            <h3 className="text-sm font-medium text-neutral-600 mb-2">
              Current Streak
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-4xl">🔥</span>
              <div>
                <div className="text-4xl font-bold text-primary">
                  {progress.consecutiveWeeksStreak}
                </div>
                <p className="text-sm text-neutral-500">weeks in a row</p>
              </div>
            </div>
          </div>
        </div>

        {/* Checkpoints */}
        <div className="mb-8">
          <h2 className="font-heading text-2xl font-bold text-primary mb-4">
            Milestones
          </h2>
          <div className="bg-white rounded-lg shadow-card p-6">
            {progress.checkpoints.length === 0 ? (
              <p className="text-neutral-600 text-center py-8">
                No milestones achieved yet. Book your first class to get started!
              </p>
            ) : (
              <div className="space-y-4">
                {progress.checkpoints.map((checkpoint) => (
                  <div
                    key={checkpoint.id}
                    className="flex items-center gap-4 p-4 bg-accent/5 rounded-lg border border-accent/20"
                  >
                    <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                      <span className="text-2xl">🏆</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-primary">
                        {getCheckpointLabel(checkpoint.checkpointType)}
                      </h3>
                      <p className="text-sm text-neutral-600">
                        Achieved on{" "}
                        {new Date(checkpoint.achievedAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">
                        At {checkpoint.classCountAtAchievement} classes
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Progress Reports */}
        <div>
          <h2 className="font-heading text-2xl font-bold text-primary mb-4">
            Progress Reports
          </h2>
          <ProgressReportsSection />
        </div>
      </main>
    </div>
  );
}
