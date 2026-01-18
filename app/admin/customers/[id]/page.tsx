"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface CustomerDetail {
  id: string;
  membershipType: string;
  membershipStatus: string;
  creditsRemaining: number;
  membershipStartDate: string | null;
  membershipEndDate: string | null;
  renewalDate: string | null;
  consecutiveWeeksStreak: number;
  totalClassesAttended: number;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string | null;
  };
  bookings: Array<{
    id: string;
    bookingStatus: string;
    bookedAt: string;
    classInstance: {
      scheduledStartTime: string;
      class: {
        name: string;
        instructorName: string;
      };
    };
    attendance: {
      attendedAt: string;
    } | null;
  }>;
  checkpoints: Array<{
    id: string;
    checkpointType: string;
    achievedAt: string;
  }>;
  creditTransactions: Array<{
    id: string;
    transactionType: string;
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    createdAt: string;
    notes: string | null;
  }>;
}

export default function CustomerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id as string;
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "bookings" | "credits" | "reports">("overview");
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [showMembershipModal, setShowMembershipModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    fetchCustomer();
  }, [customerId, router]);

  const fetchCustomer = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/admin/customers/${customerId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      setCustomer(data);
    } catch (err) {
      console.error("Error fetching customer:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreditAdjustment = async (amount: number, notes: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/admin/customers/${customerId}/credits`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount, notes }),
      });

      if (!response.ok) {
        throw new Error("Failed to adjust credits");
      }

      setShowCreditModal(false);
      fetchCustomer(); // Refresh data
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleMembershipUpdate = async (status: string, renewalDate: string | null) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/admin/customers/${customerId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          membershipStatus: status,
          renewalDate,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update membership");
      }

      setShowMembershipModal(false);
      fetchCustomer(); // Refresh data
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-neutral-600">Loading...</div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-neutral-600">Customer not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin/customers" className="text-neutral-600 hover:text-neutral-900">
              ← Back to Customers
            </Link>
            <h1 className="font-heading text-2xl font-bold text-primary">
              {customer.user.firstName} {customer.user.lastName}
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-card p-6">
            <h3 className="text-sm font-medium text-neutral-600 mb-2">Credits</h3>
            <div className="text-3xl font-bold text-primary">{customer.creditsRemaining}</div>
          </div>
          <div className="bg-white rounded-lg shadow-card p-6">
            <h3 className="text-sm font-medium text-neutral-600 mb-2">Classes Attended</h3>
            <div className="text-3xl font-bold text-primary">{customer.totalClassesAttended}</div>
          </div>
          <div className="bg-white rounded-lg shadow-card p-6">
            <h3 className="text-sm font-medium text-neutral-600 mb-2">Streak</h3>
            <div className="text-3xl font-bold text-primary">{customer.consecutiveWeeksStreak} weeks</div>
          </div>
          <div className="bg-white rounded-lg shadow-card p-6">
            <h3 className="text-sm font-medium text-neutral-600 mb-2">Status</h3>
            <span
              className={`px-3 py-1 text-sm font-medium rounded-full ${
                customer.membershipStatus === "ACTIVE"
                  ? "bg-success/10 text-success"
                  : customer.membershipStatus === "PAUSED"
                  ? "bg-warning/10 text-warning"
                  : "bg-neutral-200 text-neutral-600"
              }`}
            >
              {customer.membershipStatus}
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setShowCreditModal(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-light transition-colors"
          >
            Adjust Credits
          </button>
          <button
            onClick={() => setShowMembershipModal(true)}
            className="bg-white border-2 border-primary text-primary px-4 py-2 rounded-lg font-semibold hover:bg-neutral-50 transition-colors"
          >
            Manage Membership
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-neutral-200">
          <div className="flex gap-4">
            {[
              { id: "overview", label: "Overview" },
              { id: "bookings", label: "Bookings" },
              { id: "credits", label: "Credit History" },
              { id: "reports", label: "Progress Reports" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-neutral-600 hover:text-neutral-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="bg-white rounded-lg shadow-card p-6 space-y-6">
            <div>
              <h3 className="font-semibold text-primary mb-3">Customer Information</h3>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-neutral-600">Email</dt>
                  <dd className="text-sm font-medium text-neutral-900">{customer.user.email}</dd>
                </div>
                <div>
                  <dt className="text-sm text-neutral-600">Phone</dt>
                  <dd className="text-sm font-medium text-neutral-900">
                    {customer.user.phone || "Not provided"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-neutral-600">Membership Type</dt>
                  <dd className="text-sm font-medium text-neutral-900">{customer.membershipType}</dd>
                </div>
                <div>
                  <dt className="text-sm text-neutral-600">Renewal Date</dt>
                  <dd className="text-sm font-medium text-neutral-900">
                    {customer.renewalDate
                      ? new Date(customer.renewalDate).toLocaleDateString()
                      : "Not set"}
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="font-semibold text-primary mb-3">Milestones</h3>
              {customer.checkpoints.length === 0 ? (
                <p className="text-sm text-neutral-600">No milestones achieved yet</p>
              ) : (
                <div className="space-y-2">
                  {customer.checkpoints.map((checkpoint) => (
                    <div key={checkpoint.id} className="flex items-center gap-2 text-sm">
                      <span>🏆</span>
                      <span className="text-neutral-700">{checkpoint.checkpointType}</span>
                      <span className="text-neutral-500 text-xs">
                        ({new Date(checkpoint.achievedAt).toLocaleDateString()})
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "bookings" && (
          <div className="bg-white rounded-lg shadow-card overflow-hidden">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Class</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Attended</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {customer.bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                      {booking.classInstance.class.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                      {new Date(booking.classInstance.scheduledStartTime).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs px-2 py-1 rounded-full bg-neutral-100 text-neutral-700">
                        {booking.bookingStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                      {booking.attendance ? "Yes" : "No"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "credits" && (
          <div className="bg-white rounded-lg shadow-card overflow-hidden">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Balance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Notes</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {customer.creditTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                      {transaction.transactionType}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                        transaction.amount >= 0 ? "text-success" : "text-error"
                      }`}
                    >
                      {transaction.amount >= 0 ? "+" : ""}
                      {transaction.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                      {transaction.balanceAfter}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">{transaction.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "reports" && (
          <div className="bg-white rounded-lg shadow-card p-6">
            <p className="text-neutral-600">Progress reports will appear here</p>
          </div>
        )}
      </main>

      {showCreditModal && (
        <CreditAdjustmentModal
          currentCredits={customer.creditsRemaining}
          onClose={() => setShowCreditModal(false)}
          onAdjust={handleCreditAdjustment}
        />
      )}

      {showMembershipModal && (
        <MembershipModal
          currentStatus={customer.membershipStatus}
          renewalDate={customer.renewalDate}
          onClose={() => setShowMembershipModal(false)}
          onUpdate={handleMembershipUpdate}
        />
      )}
    </div>
  );
}

function CreditAdjustmentModal({
  currentCredits,
  onClose,
  onAdjust,
}: {
  currentCredits: number;
  onClose: () => void;
  onAdjust: (amount: number, notes: string) => void;
}) {
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseInt(amount);
    if (isNaN(numAmount) || numAmount === 0) {
      alert("Please enter a valid amount");
      return;
    }
    onAdjust(numAmount, notes);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="font-heading text-xl font-bold text-primary mb-4">Adjust Credits</h2>
        <p className="text-sm text-neutral-600 mb-4">Current credits: {currentCredits}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Amount (positive to add, negative to deduct)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary"
              placeholder="e.g., 5 or -5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary"
              rows={3}
            />
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-light"
            >
              Adjust Credits
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MembershipModal({
  currentStatus,
  renewalDate,
  onClose,
  onUpdate,
}: {
  currentStatus: string;
  renewalDate: string | null;
  onClose: () => void;
  onUpdate: (status: string, renewalDate: string | null) => void;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [renewal, setRenewal] = useState(renewalDate ? new Date(renewalDate).toISOString().split("T")[0] : "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(status, renewal ? renewal : null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="font-heading text-xl font-bold text-primary mb-4">Manage Membership</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary"
            >
              <option value="ACTIVE">Active</option>
              <option value="PAUSED">Paused</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Renewal Date</label>
            <input
              type="date"
              value={renewal}
              onChange={(e) => setRenewal(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-light"
            >
              Update Membership
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
