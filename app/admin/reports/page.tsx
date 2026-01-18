"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Customer {
  id: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface ProgressReport {
  id: string;
  reportType: string;
  title: string;
  content: string;
  goals: Array<{ goal: string; targetDate: string; status?: string }>;
  createdAt: string;
  customer: {
    user: {
      firstName: string;
      lastName: string;
    };
  };
  aiAnalysis?: {
    analysis: string;
    goalProgress: Array<{ goal: string; progress: string; status: string }>;
  };
}

export default function ReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<ProgressReport[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      // Fetch reports
      const reportsResponse = await fetch("/api/admin/progress-reports", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const reportsData = await reportsResponse.json();
      setReports(reportsData);

      // Fetch customers
      const customersResponse = await fetch("/api/admin/customers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const customersData = await customersResponse.json();
      setCustomers(customersData);
    } catch (err) {
      console.error("Error fetching data:", err);
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
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin/dashboard" className="text-neutral-600 hover:text-neutral-900">
                ← Back
              </Link>
              <h1 className="font-heading text-2xl font-bold text-primary">Progress Reports</h1>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-light transition-colors"
            >
              + Create Report
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {reports.length === 0 ? (
          <div className="bg-white rounded-lg shadow-card p-12 text-center">
            <p className="text-neutral-600 mb-4">No progress reports yet</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-accent hover:text-accent-dark font-medium"
            >
              Create your first report
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="bg-white rounded-lg shadow-card p-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-primary text-lg">{report.title}</h3>
                    <p className="text-sm text-neutral-600 mt-1">
                      {report.customer.user.firstName} {report.customer.user.lastName} •{" "}
                      {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-accent/10 text-accent">
                    {report.reportType}
                  </span>
                </div>
                <p className="text-neutral-700 mb-4">{report.content}</p>
                {report.goals && report.goals.length > 0 && (
                  <div className="mb-4 p-3 bg-neutral-50 rounded-lg">
                    <h4 className="text-sm font-semibold text-neutral-700 mb-2">Goals:</h4>
                    <ul className="space-y-1">
                      {report.goals.map((goal, idx) => (
                        <li key={idx} className="text-sm text-neutral-600">
                          • {goal.goal} {goal.targetDate && `(Target: ${new Date(goal.targetDate).toLocaleDateString()})`}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {report.aiAnalysis && (
                  <div className="mt-4 p-3 bg-accent/5 rounded-lg border border-accent/20">
                    <h4 className="text-sm font-semibold text-primary mb-2">AI Progress Analysis:</h4>
                    <p className="text-sm text-neutral-700 mb-2">{report.aiAnalysis.analysis}</p>
                    {report.aiAnalysis.goalProgress && report.aiAnalysis.goalProgress.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {report.aiAnalysis.goalProgress.map((gp, idx) => (
                          <div key={idx} className="text-sm text-neutral-600">
                            <span className="font-medium">{gp.goal}:</span> {gp.progress} ({gp.status})
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {showCreateModal && (
        <CreateReportModal
          customers={customers}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
}

function CreateReportModal({
  customers,
  onClose,
  onSuccess,
}: {
  customers: Customer[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    customerId: "",
    reportType: "PROGRESS",
    title: "",
    content: "",
    goals: [{ goal: "", targetDate: "", status: "in progress" }],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAddGoal = () => {
    setFormData({
      ...formData,
      goals: [...formData.goals, { goal: "", targetDate: "", status: "in progress" }],
    });
  };

  const handleGoalChange = (index: number, field: string, value: string) => {
    const updatedGoals = [...formData.goals];
    updatedGoals[index] = { ...updatedGoals[index], [field]: value };
    setFormData({ ...formData, goals: updatedGoals });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/admin/progress-reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customerId: formData.customerId,
          reportType: formData.reportType,
          title: formData.title,
          content: formData.content,
          goals: formData.goals.filter((g) => g.goal.trim() !== ""),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create report");
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 my-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-heading text-2xl font-bold text-primary">Create Progress Report</h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-neutral-900">
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded text-error text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Customer *</label>
            <select
              value={formData.customerId}
              onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              required
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary"
            >
              <option value="">Select customer...</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.user.firstName} {customer.user.lastName} ({customer.user.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Report Type *</label>
            <select
              value={formData.reportType}
              onChange={(e) => setFormData({ ...formData, reportType: e.target.value })}
              required
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary"
            >
              <option value="PROGRESS">Progress Update</option>
              <option value="GOAL_SETTING">Goal Setting</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Content *</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
              rows={6}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-neutral-700">Goals</label>
              <button
                type="button"
                onClick={handleAddGoal}
                className="text-sm text-accent hover:text-accent-dark font-medium"
              >
                + Add Goal
              </button>
            </div>
            <div className="space-y-2">
              {formData.goals.map((goal, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={goal.goal}
                    onChange={(e) => handleGoalChange(index, "goal", e.target.value)}
                    placeholder="Goal description"
                    className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="date"
                    value={goal.targetDate}
                    onChange={(e) => handleGoalChange(index, "targetDate", e.target.value)}
                    className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-neutral-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-light disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
