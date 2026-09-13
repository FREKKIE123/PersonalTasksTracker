import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, TrendingUp } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { getItems, addItem, updateItem, deleteItem, COLLECTIONS, orderBy } from "../lib/firestore";
import {
  Button, Card, Input, Textarea, Select, Badge, Modal, ConfirmDialog,
  EmptyState, LoadingState, StatCard, SearchInput, useToast, Toast
} from "../components/ui";
import type { Trade } from "./types";

const PAIRS = ["EUR/USD", "GBP/USD", "USD/JPY", "USD/CHF", "AUD/USD", "NZD/USD", "USD/CAD", "EUR/GBP", "XAU/USD", "Other"];
const STRATEGIES = ["Trend Following", "Breakout", "Reversal", "Scalping", "Swing", "News", "Other"];

const EMPTY_FORM: Omit<Trade, "id" | "createdAt"> = {
  date: new Date().toISOString().split("T")[0],
  pair: "EUR/USD", direction: "Buy",
  entry: 0, exit: 0, stopLoss: undefined, takeProfit: undefined, lotSize: undefined,
  pl: 0, strategy: "", result: "Win", followedRules: "Yes", notes: "",
};

type Filter = "day" | "week" | "month" | "all";

function filterByRange(trades: Trade[], range: Filter) {
  const now = new Date();
  const startOf = (d: Date) => d.toISOString().split("T")[0];
  if (range === "all") return trades;
  if (range === "day") return trades.filter((t) => t.date === startOf(now));
  if (range === "week") {
    const d = new Date(now); d.setDate(d.getDate() - 7);
    return trades.filter((t) => t.date >= startOf(d));
  }
  if (range === "month") {
    const d = new Date(now.getFullYear(), now.getMonth(), 1);
    return trades.filter((t) => t.date >= startOf(d));
  }
  return trades;
}

export default function Forex() {
  const { user } = useAuth();
  const { toast, show } = useToast();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [range, setRange] = useState<Filter>("month");
  const [formOpen, setFormOpen] = useState(false);
  const [editTrade, setEditTrade] = useState<Trade | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!user) return;
    try {
      const data = await getItems<Trade>(user.uid, COLLECTIONS.trades, orderBy("date", "desc"));
      setTrades(data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [user]);

  const openAdd = () => { setForm({ ...EMPTY_FORM }); setEditTrade(null); setFormOpen(true); };
  const openEdit = (t: Trade) => { setForm({ ...t }); setEditTrade(t); setFormOpen(true); };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const data = { ...form, pl: Number(form.pl), entry: Number(form.entry), exit: Number(form.exit) };
      if (editTrade) {
        await updateItem(user.uid, COLLECTIONS.trades, editTrade.id, data);
        show("Trade updated");
      } else {
        await addItem(user.uid, COLLECTIONS.trades, data);
        show("Trade added");
      }
      setFormOpen(false);
      await load();
    } catch { show("Failed to save", "error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    await deleteItem(user.uid, COLLECTIONS.trades, id);
    show("Trade deleted");
    await load();
  };

  const ranged = filterByRange(trades, range);
  const filtered = ranged.filter((t) => !search || t.pair.toLowerCase().includes(search.toLowerCase()) || (t.strategy || "").toLowerCase().includes(search.toLowerCase()));

  const totalPL = ranged.reduce((s, t) => s + (t.pl || 0), 0);
  const wins = ranged.filter((t) => t.result === "Win");
  const losses = ranged.filter((t) => t.result === "Loss");
  const winRate = ranged.length > 0 ? Math.round((wins.length / ranged.length) * 100) : 0;
  const avgWin = wins.length > 0 ? wins.reduce((s, t) => s + t.pl, 0) / wins.length : 0;
  const avgLoss = losses.length > 0 ? losses.reduce((s, t) => s + t.pl, 0) / losses.length : 0;

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Trades" value={ranged.length} />
        <StatCard label="Win Rate" value={`${winRate}%`} />
        <StatCard label="Total P/L" value={`${totalPL >= 0 ? "+" : ""}BWP ${totalPL.toFixed(0)}`} sub={range === "month" ? "This month" : range} />
        <StatCard label="Avg Win" value={`BWP ${avgWin.toFixed(0)}`} />
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
        <SearchInput value={search} onChange={setSearch} placeholder="Search pairs, strategies…" />
        <div className="flex gap-1 shrink-0">
          {(["day", "week", "month", "all"] as Filter[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`h-7 px-3 text-xs rounded-[var(--radius)] capitalize transition-colors ${range === r ? "bg-[var(--foreground)] text-[var(--background)]" : "bg-[var(--card)] border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}`}
            >{r}</button>
          ))}
        </div>
        <Button onClick={openAdd} size="sm"><Plus size={13} />Add Trade</Button>
      </div>

      {/* Trades */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title={trades.length === 0 ? "No trades recorded." : "No trades in range."}
          description="Track every trade to improve your performance."
          action={trades.length === 0 ? <Button size="sm" onClick={openAdd}><Plus size={13} />Add Trade</Button> : undefined}
        />
      ) : (
        <Card>
          <div className="hidden sm:grid grid-cols-[90px_100px_60px_80px_80px_80px_70px_80px] gap-3 px-4 py-2 border-b border-[var(--border)]">
            {["Date", "Pair", "Dir", "Entry", "Exit", "P/L", "Result", ""].map((h) => (
              <span key={h} className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">{h}</span>
            ))}
          </div>
          {filtered.map((t, i) => (
            <div key={t.id} className={`group px-4 py-3 ${i < filtered.length - 1 ? "border-b border-[var(--border)]" : ""}`}>
              {/* Mobile */}
              <div className="sm:hidden flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium font-mono">{t.pair}</span>
                    <Badge variant={t.direction === "Buy" ? "applied" : "rejected"}>{t.direction}</Badge>
                    <Badge variant={t.result === "Win" ? "win" : t.result === "Loss" ? "loss" : "breakeven"}>{t.result}</Badge>
                  </div>
                  <div className="flex gap-3 mt-1 text-xs text-[var(--muted-foreground)]">
                    <span className="font-mono">{t.date}</span>
                    <span className={`font-mono font-semibold ${t.pl >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {t.pl >= 0 ? "+" : ""}BWP {t.pl.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(t)} className="p-1.5 rounded hover:bg-[var(--muted)] text-[var(--muted-foreground)]"><Pencil size={13} /></button>
                  <button onClick={() => setDeleteId(t.id)} className="p-1.5 rounded hover:bg-red-50 text-[var(--muted-foreground)] hover:text-red-600"><Trash2 size={13} /></button>
                </div>
              </div>
              {/* Desktop */}
              <div className="hidden sm:grid grid-cols-[90px_100px_60px_80px_80px_80px_70px_80px] gap-3 items-center">
                <span className="text-xs font-mono text-[var(--muted-foreground)]">{t.date}</span>
                <span className="text-sm font-medium font-mono">{t.pair}</span>
                <Badge variant={t.direction === "Buy" ? "applied" : "rejected"}>{t.direction}</Badge>
                <span className="text-xs font-mono">{t.entry}</span>
                <span className="text-xs font-mono">{t.exit}</span>
                <span className={`text-sm font-mono font-medium ${t.pl >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {t.pl >= 0 ? "+" : ""}BWP {t.pl.toFixed(2)}
                </span>
                <Badge variant={t.result === "Win" ? "win" : t.result === "Loss" ? "loss" : "breakeven"}>{t.result}</Badge>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                  <button onClick={() => openEdit(t)} className="p-1.5 rounded hover:bg-[var(--muted)] text-[var(--muted-foreground)]"><Pencil size={13} /></button>
                  <button onClick={() => setDeleteId(t.id)} className="p-1.5 rounded hover:bg-red-50 text-[var(--muted-foreground)] hover:text-red-600"><Trash2 size={13} /></button>
                </div>
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* Form */}
      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editTrade ? "Edit Trade" : "Add Trade"} size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Saving…" : editTrade ? "Update" : "Add"}</Button>
          </>
        }
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Input label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <Select label="Pair" value={form.pair} options={PAIRS.map((p) => ({ value: p, label: p }))} onChange={(e) => setForm({ ...form, pair: e.target.value })} />
          <Select label="Direction" value={form.direction} options={[{ value: "Buy", label: "Buy" }, { value: "Sell", label: "Sell" }]} onChange={(e) => setForm({ ...form, direction: e.target.value as "Buy" | "Sell" })} />
          <Input label="Entry Price" type="number" step="0.00001" value={form.entry || ""} onChange={(e) => setForm({ ...form, entry: parseFloat(e.target.value) || 0 })} />
          <Input label="Exit Price" type="number" step="0.00001" value={form.exit || ""} onChange={(e) => setForm({ ...form, exit: parseFloat(e.target.value) || 0 })} />
          <Input label="P/L (BWP)" type="number" step="0.01" value={form.pl || ""} onChange={(e) => setForm({ ...form, pl: parseFloat(e.target.value) || 0 })} />
          <Input label="Stop Loss" type="number" step="0.00001" value={form.stopLoss || ""} onChange={(e) => setForm({ ...form, stopLoss: parseFloat(e.target.value) || undefined })} />
          <Input label="Take Profit" type="number" step="0.00001" value={form.takeProfit || ""} onChange={(e) => setForm({ ...form, takeProfit: parseFloat(e.target.value) || undefined })} />
          <Input label="Lot Size" type="number" step="0.01" value={form.lotSize || ""} onChange={(e) => setForm({ ...form, lotSize: parseFloat(e.target.value) || undefined })} />
          <Select label="Result" value={form.result} options={[{ value: "Win", label: "Win" }, { value: "Loss", label: "Loss" }, { value: "Break-even", label: "Break-even" }]} onChange={(e) => setForm({ ...form, result: e.target.value as Trade["result"] })} />
          <Select label="Followed Rules" value={form.followedRules} options={[{ value: "Yes", label: "Yes" }, { value: "Partially", label: "Partially" }, { value: "No", label: "No" }]} onChange={(e) => setForm({ ...form, followedRules: e.target.value as Trade["followedRules"] })} />
          <Select label="Strategy" value={form.strategy || ""} options={[{ value: "", label: "Select…" }, ...STRATEGIES.map((s) => ({ value: s, label: s }))]} onChange={(e) => setForm({ ...form, strategy: e.target.value })} />
          <div className="col-span-2 sm:col-span-3">
            <Textarea label="Notes" value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="Setup, emotions, mistakes…" />
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => handleDelete(deleteId!)} title="Delete Trade" message="Delete this trade record? This cannot be undone." />
      <Toast toast={toast} />
    </div>
  );
}
