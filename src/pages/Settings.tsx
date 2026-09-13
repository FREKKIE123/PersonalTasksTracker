import { useState } from "react";
import { LogOut, Download, Moon, Sun } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Button, Card, SectionHeader, Toggle, useToast, Toast } from "../components/ui";

export default function Settings() {
  const { user, logout } = useAuth();
  const { toast, show } = useToast();
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [notifications, setNotifications] = useState(false);
  const [currency, setCurrency] = useState("BWP");

  const toggleDark = (v: boolean) => {
    setDarkMode(v);
    document.documentElement.classList.toggle("dark", v);
  };

  const handleExport = () => {
    show("Data export is not yet implemented. Check back soon.", "error");
  };

  return (
    <div className="space-y-8 max-w-lg">
      {/* Account */}
      <div>
        <SectionHeader title="Account" />
        <Card className="p-4 space-y-3">
          <div>
            <p className="text-xs text-[var(--muted-foreground)]">Signed in as</p>
            <p className="text-sm font-medium font-mono text-[var(--foreground)]">{user?.email}</p>
          </div>
          <div className="pt-2 border-t border-[var(--border)]">
            <Button variant="danger" onClick={() => logout()}>
              <LogOut size={13} />Log out
            </Button>
          </div>
        </Card>
      </div>

      {/* Appearance */}
      <div>
        <SectionHeader title="Appearance" />
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">Dark mode</p>
              <p className="text-xs text-[var(--muted-foreground)]">Switch to a darker interface</p>
            </div>
            <div className="flex items-center gap-2">
              <Sun size={13} className="text-[var(--muted-foreground)]" />
              <Toggle checked={darkMode} onChange={toggleDark} />
              <Moon size={13} className="text-[var(--muted-foreground)]" />
            </div>
          </div>
        </Card>
      </div>

      {/* Preferences */}
      <div>
        <SectionHeader title="Preferences" />
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">Default currency</p>
              <p className="text-xs text-[var(--muted-foreground)]">Used in Forex and financial displays</p>
            </div>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="h-7 px-2 text-sm bg-[var(--background)] border border-[var(--border)] rounded-[var(--radius)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            >
              {["BWP", "USD", "GBP", "EUR", "ZAR"].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </Card>
      </div>

      {/* Notifications */}
      <div>
        <SectionHeader title="Notifications" />
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">Browser notifications</p>
              <p className="text-xs text-[var(--muted-foreground)]">Get notified about reminders and follow-ups</p>
            </div>
            <Toggle checked={notifications} onChange={setNotifications} />
          </div>
          {notifications && (
            <p className="text-xs text-[var(--muted-foreground)] bg-[var(--muted)] px-3 py-2 rounded">
              Make sure to allow notifications in your browser settings.
            </p>
          )}
        </Card>
      </div>

      {/* Data */}
      <div>
        <SectionHeader title="Data" />
        <Card className="p-4 space-y-3">
          <div>
            <p className="text-sm font-medium text-[var(--foreground)]">Export your data</p>
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Download all your data as JSON</p>
          </div>
          <Button variant="secondary" onClick={handleExport}>
            <Download size={13} />Export JSON
          </Button>
        </Card>
      </div>

      <Toast toast={toast} />
    </div>
  );
}
