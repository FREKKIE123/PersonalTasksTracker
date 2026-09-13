import { useEffect, useState } from "react";
import { Plus, Bell, Trash2, Pencil } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { getItems, addItem, updateItem, deleteItem, COLLECTIONS } from "../lib/firestore";
import {
  Button, Card, Input, Textarea, Select, Modal, ConfirmDialog,
  EmptyState, LoadingState, CheckItem, SectionHeader, useToast, Toast
} from "../components/ui";
import type { Reminder } from "./types";

const CATEGORIES = [
  { value: "Job Hunt", label: "Job Hunt" },
  { value: "Learning", label: "Learning" },
  { value: "Forex", label: "Forex" },
  { value: "Personal", label: "Personal" },
  { value: "Health", label: "Health" },
  { value: "Finance", label: "Finance" },
];

const RECURRING = [
  { value: "none", label: "None" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

const EMPTY: Omit<Reminder, "id" | "createdAt"> = {
  title: "", dueDate: new Date().toISOString().split("T")[0], dueTime: "",
  category: "Personal", recurring: "none", completed: false, notes: "",
};

export default function Reminders() {
  const { user } = useAuth();
  const { toast, show } = useToast();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editReminder, setEditReminder] = useState<Reminder | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!user) return;
    try {
      const data = await getItems<Reminder>(user.uid, COLLECTIONS.reminders);
      setReminders(data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [user]);

  const openAdd = () => { setForm({ ...EMPTY }); setEditReminder(null); setFormOpen(true); };
  const openEdit = (r: Reminder) => { setForm({ ...r }); setEditReminder(r); setFormOpen(true); };

  const handleSave = async () => {
    if (!user || !form.title) return;
    setSaving(true);
    try {
      if (editReminder) {
        await updateItem(user.uid, COLLECTIONS.reminders, editReminder.id, form);
        show("Reminder updated");
      } else {
        await addItem(user.uid, COLLECTIONS.reminders, form);
        show("Reminder added");
      }
      setFormOpen(false);
      await load();
    } catch { show("Failed to save", "error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    await deleteItem(user.uid, COLLECTIONS.reminders, id);
    show("Reminder deleted");
    await load();
  };

  const toggle = async (r: Reminder) => {
    if (!user) return;
    await updateItem(user.uid, COLLECTIONS.reminders, r.id, { completed: !r.completed });
    setReminders((prev) => prev.map((x) => x.id === r.id ? { ...x, completed: !x.completed } : x));
  };

  const today = new Date().toISOString().split("T")[0];
  const todayItems = reminders.filter((r) => !r.completed && r.dueDate === today);
  const upcomingItems = reminders.filter((r) => !r.completed && r.dueDate > today).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const overdueItems = reminders.filter((r) => !r.completed && r.dueDate < today).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const completedItems = reminders.filter((r) => r.completed);

  const fmtDate = (d: string) => {
    const date = new Date(d + "T00:00:00");
    const diff = Math.floor((date.getTime() - new Date().setHours(0,0,0,0)) / 86400000);
    if (diff === 0) return "Today";
    if (diff === 1) return "Tomorrow";
    if (diff === -1) return "Yesterday";
    if (diff > 0 && diff < 7) return date.toLocaleDateString("en-GB", { weekday: "long" });
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  };

  if (loading) return <LoadingState />;

  const ReminderCard = ({ r }: { r: Reminder }) => (
    <div className="group flex items-center gap-1">
      <div className="flex-1">
        <CheckItem
          checked={r.completed}
          onToggle={() => toggle(r)}
          label={r.title}
          sub={`${fmtDate(r.dueDate)}${r.dueTime ? ` at ${r.dueTime}` : ""}${r.category ? ` · ${r.category}` : ""}`}
        />
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button onClick={() => openEdit(r)} className="p-1.5 rounded hover:bg-[var(--muted)] text-[var(--muted-foreground)]"><Pencil size={12} /></button>
        <button onClick={() => setDeleteId(r.id)} className="p-1.5 rounded hover:bg-red-50 text-[var(--muted-foreground)] hover:text-red-600"><Trash2 size={12} /></button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button size="sm" onClick={openAdd}><Plus size={13} />Add Reminder</Button>
      </div>

      {reminders.length === 0 ? (
        <EmptyState icon={Bell} title="No reminders yet." description="Set reminders for follow-ups, study sessions, and reviews." action={<Button size="sm" onClick={openAdd}><Plus size={13} />Add Reminder</Button>} />
      ) : (
        <div className="space-y-6">
          {overdueItems.length > 0 && (
            <Card className="p-3">
              <SectionHeader title={`Overdue (${overdueItems.length})`} />
              {overdueItems.map((r) => <ReminderCard key={r.id} r={r} />)}
            </Card>
          )}

          <Card className="p-3">
            <SectionHeader title="Today" />
            {todayItems.length === 0 ? (
              <p className="text-sm text-[var(--muted-foreground)] px-2 py-2">Nothing due today.</p>
            ) : (
              todayItems.map((r) => <ReminderCard key={r.id} r={r} />)
            )}
          </Card>

          {upcomingItems.length > 0 && (
            <Card className="p-3">
              <SectionHeader title="Upcoming" />
              {upcomingItems.map((r) => <ReminderCard key={r.id} r={r} />)}
            </Card>
          )}

          {completedItems.length > 0 && (
            <Card className="p-3">
              <SectionHeader title={`Completed (${completedItems.length})`} />
              {completedItems.slice(0, 10).map((r) => <ReminderCard key={r.id} r={r} />)}
            </Card>
          )}
        </div>
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editReminder ? "Edit Reminder" : "Add Reminder"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.title}>{saving ? "Saving…" : editReminder ? "Update" : "Add"}</Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-3">
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="col-span-2" required />
          <Input label="Due Date" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          <Input label="Time (optional)" type="time" value={form.dueTime || ""} onChange={(e) => setForm({ ...form, dueTime: e.target.value })} />
          <Select label="Category" value={form.category || "Personal"} options={CATEGORIES} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <Select label="Recurring" value={form.recurring || "none"} options={RECURRING} onChange={(e) => setForm({ ...form, recurring: e.target.value as Reminder["recurring"] })} />
          <Textarea label="Notes" value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="col-span-2" />
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => handleDelete(deleteId!)} title="Delete Reminder" message="Delete this reminder? This cannot be undone." />
      <Toast toast={toast} />
    </div>
  );
}
