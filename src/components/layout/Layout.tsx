import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  TrendingUp,
  Award,
  CalendarDays,
  Bell,
  Settings,
  LogOut,
  Search,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/jobs", label: "Job Hunt", icon: Briefcase },
  { to: "/forex", label: "Forex", icon: TrendingUp },
  { to: "/certifications", label: "Certifications", icon: Award },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/reminders", label: "Reminders", icon: Bell },
];

function NavItem({ to, label, icon: Icon }: { to: string; label: string; icon: React.ComponentType<{ size?: number }> }) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        `flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius)] text-sm transition-colors ${
          isActive
            ? "bg-[var(--secondary)] text-[var(--foreground)] font-medium"
            : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
        }`
      }
    >
      <Icon size={15} />
      <span>{label}</span>
    </NavLink>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();

  // Close mobile nav on route change
  if (mobileOpen && location.pathname) {
    // Defer close after render
  }

  const pageTitle = NAV_ITEMS.find((n) => n.to === location.pathname)?.label ||
    (location.pathname === "/settings" ? "Settings" : "FrekkieMe");

  return (
    <div className="min-h-screen bg-[var(--background)] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-[220px] shrink-0 border-r border-[var(--border)] bg-[var(--card)] fixed inset-y-0 left-0 z-30">
        {/* Logo */}
        <div className="px-4 py-4 border-b border-[var(--border)]">
          <span className="text-sm font-semibold text-[var(--foreground)] tracking-tight">FrekkieMe</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-2 py-3 border-t border-[var(--border)] flex flex-col gap-0.5">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius)] text-sm transition-colors ${
                isActive
                  ? "bg-[var(--secondary)] text-[var(--foreground)] font-medium"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
              }`
            }
          >
            <Settings size={15} />
            <span>Settings</span>
          </NavLink>
          <button
            onClick={() => logout()}
            className="flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius)] text-sm text-[var(--muted-foreground)] hover:text-red-600 hover:bg-red-50 transition-colors w-full text-left"
          >
            <LogOut size={15} />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Mobile overlay nav */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/20" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64 bg-[var(--card)] border-r border-[var(--border)] flex flex-col">
            <div className="px-4 py-4 border-b border-[var(--border)] flex items-center justify-between">
              <span className="text-sm font-semibold">FrekkieMe</span>
              <button onClick={() => setMobileOpen(false)} className="p-1 rounded hover:bg-[var(--muted)]">
                <X size={15} />
              </button>
            </div>
            <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5">
              {NAV_ITEMS.map((item) => (
                <div key={item.to} onClick={() => setMobileOpen(false)}>
                  <NavItem {...item} />
                </div>
              ))}
            </nav>
            <div className="px-2 py-3 border-t border-[var(--border)] flex flex-col gap-0.5">
              <div onClick={() => setMobileOpen(false)}>
                <NavLink
                  to="/settings"
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius)] text-sm transition-colors ${isActive ? "bg-[var(--secondary)] font-medium" : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]"}`
                  }
                >
                  <Settings size={15} />Settings
                </NavLink>
              </div>
              <button onClick={() => logout()} className="flex items-center gap-2.5 px-3 py-2 text-sm text-[var(--muted-foreground)] hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                <LogOut size={15} />Log out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 md:ml-[220px] flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-[var(--background)]/90 backdrop-blur-sm border-b border-[var(--border)] h-12 flex items-center px-4 gap-3">
          <button className="md:hidden p-1.5 rounded hover:bg-[var(--muted)] transition-colors" onClick={() => setMobileOpen(true)}>
            <Menu size={16} />
          </button>
          <span className="text-sm font-medium text-[var(--foreground)] flex-1">{pageTitle}</span>
          <button
            className="p-1.5 rounded hover:bg-[var(--muted)] transition-colors text-[var(--muted-foreground)]"
            onClick={() => setSearchOpen(!searchOpen)}
          >
            <Search size={15} />
          </button>
        </header>

        {/* Search bar */}
        {searchOpen && (
          <div className="border-b border-[var(--border)] bg-[var(--card)] px-4 py-2">
            <input
              autoFocus
              placeholder="Search across FrekkieMe..."
              onBlur={() => setSearchOpen(false)}
              className="w-full text-sm bg-transparent text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none"
            />
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 px-4 py-6 md:px-6 max-w-5xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 inset-x-0 z-30 md:hidden bg-[var(--card)] border-t border-[var(--border)] flex">
        {NAV_ITEMS.slice(0, 5).map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors ${
                isActive ? "text-[var(--accent)]" : "text-[var(--muted-foreground)]"
              }`
            }
          >
            <Icon size={18} />
            <span>{label.split(" ")[0]}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
