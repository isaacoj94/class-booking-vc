"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface UserData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
}

interface CustomerData {
  membershipType: string;
  membershipStatus: string;
  renewalDate: string | null;
}

export default function SettingsPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
      const response = await fetch("/api/customers/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      setUserData({
        email: data.user.email,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        phone: data.user.phone,
      });
      setCustomerData({
        membershipType: data.membershipType,
        membershipStatus: data.membershipStatus,
        renewalDate: data.renewalDate,
      });
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("accessToken");
      const formData = new FormData(e.currentTarget);
      
      const response = await fetch("/api/customers/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: formData.get("firstName"),
          lastName: formData.get("lastName"),
          phone: formData.get("phone"),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      setSuccess("Profile updated successfully!");
      fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-neutral-600">Loading...</div>
      </div>
    );
  }

  if (!userData || !customerData) {
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
            <h1 className="font-heading text-2xl font-bold text-primary">Account Settings</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Information */}
        <div className="bg-white rounded-lg shadow-card p-6 mb-6">
          <h2 className="font-heading text-xl font-bold text-primary mb-6">Profile Information</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded text-error text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-success/10 border border-success/20 rounded text-success text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-neutral-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  defaultValue={userData.firstName}
                  required
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-neutral-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  defaultValue={userData.lastName}
                  required
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={userData.email}
                disabled
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg bg-neutral-50 text-neutral-500"
              />
              <p className="mt-1 text-xs text-neutral-500">Email cannot be changed</p>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                defaultValue={userData.phone || ""}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>

        {/* Membership Information */}
        <div className="bg-white rounded-lg shadow-card p-6">
          <h2 className="font-heading text-xl font-bold text-primary mb-6">Membership</h2>
          
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-neutral-600">Membership Type</dt>
              <dd className="mt-1 text-sm text-neutral-900">{customerData.membershipType}</dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-neutral-600">Status</dt>
              <dd className="mt-1">
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${
                    customerData.membershipStatus === "ACTIVE"
                      ? "bg-success/10 text-success"
                      : customerData.membershipStatus === "PAUSED"
                      ? "bg-warning/10 text-warning"
                      : "bg-neutral-200 text-neutral-600"
                  }`}
                >
                  {customerData.membershipStatus}
                </span>
              </dd>
            </div>

            {customerData.renewalDate && (
              <div>
                <dt className="text-sm font-medium text-neutral-600">Renewal Date</dt>
                <dd className="mt-1 text-sm text-neutral-900">
                  {new Date(customerData.renewalDate).toLocaleDateString()}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </main>
    </div>
  );
}
