import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Briefcase, TrendingUp, Award, Bell } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { getItems, COLLECTIONS, orderBy } from "../lib/firestore";
import { StatCard, Card, SectionHeader, Badge, LoadingState } from "../components/ui";
import type { JobApplication, Trade, Certification, Reminder } from "./types";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function fmtShortDate(s: string) {
  if (!s) return "";
  const d = new Date(s);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default function Dashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [certs, setCerts] = useState<Certification[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getItems<JobApplication>(user.uid, COLLECTIONS.jobs),
      getItems<Trade>(user.uid, COLLECTIONS.trades),
      getItems<Certification>(user.uid, COLLECTIONS.certs),
      getItems<Reminder>(user.uid, COLLECTIONS.reminders),
    ]).then(([j, t, c, r]) => {
      setJobs(j);
      setTrades(t);
      setCerts(c);
      setReminders(r.filter((rm) => !rm.completed));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  if (loading) return <LoadingState />;

  // Job stats
  const totalJobs = jobs.length;
  const interviews = jobs.filter((j) => j.status === "Interview").length;
  const pending = jobs.filter((j) => ["Applied", "Under Review", "Assessment"].includes(j.status)).length;
  const offers = jobs.filter((j) => j.status === "Offer").length;

  // Forex stats (this month)
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  const monthTrades = trades.filter((t) => t.date >= monthStart);
  const monthPL = monthTrades.reduce((sum, t) => sum + (t.pl || 0), 0);
  const wins = monthTrades.filter((t) => t.result === "Win").length;
  const winRate = monthTrades.length > 0 ? Math.round((wins / monthTrades.length) * 100) : 0;

  // Cert stats
  const inProgress = certs.filter((c) => c.status === "In Progress");
  const completed = certs.filter((c) => c.status === "Completed").length;

  // Upcoming: reminders + job follow-ups, next 7 days
  const today = now.toISOString().split("T")[0];
  const nextWeek = new Date(now.getTime() + 7 * 86400000).toISOString().split("T")[0];

  const upcoming: { label: string; date: string; category: string }[] = [];

  reminders
    .filter((r) => r.dueDate >= today)
    .slice(0, 5)
    .forEach((r) => upcoming.push({ label: r.title, date: r.dueDate, category: r.category || "Personal" }));

  jobs
    .filter((j) => j.followUpDate && j.followUpDate >= today)
    .forEach((j) => upcoming.push({ label: `Follow up — ${j.company}`, date: j.followUpDate!, category: "Job Hunt" }));

  inProgress.forEach((c) => {
    if (c.targetDate && c.targetDate >= today) {
      upcoming.push({ label: `${c.name} deadline`, date: c.targetDate, category: "Learning" });
    }
  });

  upcoming.sort((a, b) => a.date.localeCompare(b.date));
  const topUpcoming = upcoming.slice(0, 5);

  const catColor: Record<string, string> = {
    "Job Hunt": "text-blue-600",
    Learning: "text-[var(--accent)]",
    Forex: "text-amber-600",
    Personal: "text-[var(--muted-foreground)]",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-[var(--foreground)]">
          {greeting()}, Frekkie.
        </h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-0.5">{fmtDate(now)}</p>
      </div>

      {/* Overview grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Job Hunt */}
        <Card className="p-4 col-span-1 sm:col-span-2 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Briefcase size={14} className="text-[var(--muted-foreground)]" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">Job Hunt</span>
            </div>
            <Link to="/jobs" className="text-xs text-[var(--accent)] hover:underline flex items-center gap-0.5">View <ArrowRight size={11} /></Link>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Applications", value: totalJobs },
              { label: "Interviews", value: interviews },
              { label: "Pending", value: pending },
              { label: "Offers", value: offers },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <div className="text-xl font-semibold font-mono text-[var(--foreground)]">{value}</div>
                <div className="text-[10px] text-[var(--muted-foreground)]">{label}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Forex */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-[var(--muted-foreground)]" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">Forex</span>
            </div>
            <Link to="/forex" className="text-xs text-[var(--accent)] hover:underline flex items-center gap-0.5">View <ArrowRight size={11} /></Link>
          </div>
          <div className="space-y-1.5">
            <div>
              <span className={`text-xl font-semibold font-mono ${monthPL >= 0 ? "text-green-600" : "text-red-600"}`}>
                {monthPL >= 0 ? "+" : ""}BWP {monthPL.toFixed(2)}
              </span>
              <p className="text-[10px] text-[var(--muted-foreground)]">This month</p>
            </div>
            <div className="flex gap-3 text-xs text-[var(--muted-foreground)]">
              <span><span className="font-mono font-medium text-[var(--foreground)]">{winRate}%</span> win rate</span>
              <span><span className="font-mono font-medium text-[var(--foreground)]">{monthTrades.length}</span> trades</span>
            </div>
          </div>
        </Card>

        {/* Learning */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Award size={14} className="text-[var(--muted-foreground)]" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">Learning</span>
            </div>
            <Link to="/certifications" className="text-xs text-[var(--accent)] hover:underline flex items-center gap-0.5">View <ArrowRight size={11} /></Link>
          </div>
          <div className="space-y-1.5">
            <div>
              <span className="text-xl font-semibold font-mono text-[var(--foreground)]">{completed}</span>
              <p className="text-[10px] text-[var(--muted-foreground)]">Completed</p>
            </div>
            {inProgress[0] && (
              <div>
                <p className="text-xs font-medium text-[var(--foreground)] truncate">{inProgress[0].name}</p>
                <div className="mt-1 h-1 bg-[var(--muted)] rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--accent)] rounded-full" style={{ width: `${inProgress[0].progress || 0}%` }} />
                </div>
                <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5">{inProgress[0].progress || 0}%</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Upcoming */}
      <div>
        <SectionHeader
          title="Upcoming"
          action={
            <Link to="/reminders" className="text-xs text-[var(--accent)] hover:underline flex items-center gap-0.5">All <ArrowRight size={11} /></Link>
          }
        />
        {topUpcoming.length === 0 ? (
          <Card className="p-4">
            <p className="text-sm text-[var(--muted-foreground)] text-center py-4">Nothing coming up. Add reminders to stay on track.</p>
          </Card>
        ) : (
          <Card>
            {topUpcoming.map((item, i) => (
              <div key={i} className={`flex items-center gap-3 px-4 py-3 ${i < topUpcoming.length - 1 ? "border-b border-[var(--border)]" : ""}`}>
                <Bell size={13} className="text-[var(--muted-foreground)] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[var(--foreground)] truncate">{item.label}</p>
                  <p className={`text-xs ${catColor[item.category] || "text-[var(--muted-foreground)]"}`}>{item.category}</p>
                </div>
                <span className="text-xs font-mono text-[var(--muted-foreground)] shrink-0">{fmtShortDate(item.date)}</span>
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}
