"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  icon?: string;
}

interface NavigationProps {
  role?: "customer" | "admin";
}

export default function Navigation({ role = "customer" }: NavigationProps) {
  const pathname = usePathname();
  const router = useRouter();

  const customerNavItems: NavItem[] = [
    { label: "Dashboard", href: "/dashboard", icon: "🏠" },
    { label: "Book Class", href: "/dashboard/classes/book", icon: "📅" },
    { label: "Calendar", href: "/dashboard/classes/calendar", icon: "📆" },
    { label: "Progress", href: "/dashboard/progress", icon: "📊" },
    { label: "Settings", href: "/dashboard/settings", icon: "⚙️" },
  ];

  const adminNavItems: NavItem[] = [
    { label: "Dashboard", href: "/admin/dashboard", icon: "🏠" },
    { label: "Customers", href: "/admin/customers", icon: "👥" },
    { label: "Classes", href: "/admin/classes", icon: "📚" },
    { label: "Leaderboard", href: "/admin/leaderboard", icon: "🏆" },
    { label: "Reports", href: "/admin/reports", icon: "📋" },
  ];

  const navItems = role === "admin" ? adminNavItems : customerNavItems;

  const isActive = (href: string) => {
    if (href === "/dashboard" || href === "/admin/dashboard") {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <nav className="bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? "bg-primary/10 text-primary"
                    : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
                }`}
              >
                {item.icon && <span>{item.icon}</span>}
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
