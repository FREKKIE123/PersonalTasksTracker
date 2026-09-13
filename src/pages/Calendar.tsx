import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Pencil, Trash2, CalendarDays } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { getItems, addItem, updateItem, deleteItem, COLLECTIONS } from "../lib/firestore";
import {
  Button, Card, Input, Textarea, Select, Badge, Modal, ConfirmDialog,
  EmptyState, LoadingState, useToast, Toast
} from "../components/ui";
import type { CalendarEvent } from "./types";

const CATEGORIES = [
  { value: "Job", label: "Job" },
  { value: "Interview", label: "Interview" },
  { value: "Follow-up", label: "Follow-up" },
  { value: "Learning", label: "Learning" },
  { value: "Forex", label: "Forex" },
  { value: "Personal", label: "Personal" },
];

const catColor: Record<string, string> = {
  Job: "bg-blue-100 text-blue-700",
  Interview: "bg-[#E8F2F0] text-[#1F5C52]",
  "Follow-up": "bg-amber-50 text-amber-700",
  Learning: "bg-purple-50 text-purple-700",
  Forex: "bg-green-50 text-green-700",
  Personal: "bg-zinc-100 text-zinc-600",
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const EMPTY: Omit<CalendarEvent, "id" | "createdAt"> = {
  title: "", date: new Date().toISOString().split("T")[0], startTime: "", endTime: "",
  category: "Personal", notes: "", reminder: false,
};

export default function CalendarPage() {
  const { user } = useAuth();
  const { toast, show } = useToast();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(new Date());
  const [selected, setSelected] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<CalendarEvent | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!user) return;
    try {
      const data = await getItems<CalendarEvent>(user.uid, COLLECTIONS.events);
      setEvents(data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [user]);

  const year = current.getFullYear();
  const month = current.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().toISOString().split("T")[0];

  const toKey = (y: number, m: number, d: number) =>
    `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const eventsByDate: Record<string, CalendarEvent[]> = {};
  events.forEach((e) => {
    if (!eventsByDate[e.date]) eventsByDate[e.date] = [];
    eventsByDate[e.date].push(e);
  });

  const selectedEvents = selected ? (eventsByDate[selected] || []) : [];

  const openAdd = (date?: string) => {
    setForm({ ...EMPTY, date: date || new Date().toISOString().split("T")[0] });
    setEditEvent(null);
    setFormOpen(true);
  };

  const openEdit = (e: CalendarEvent) => {
    setForm({ ...e });
    setEditEvent(e);
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!user || !form.title) return;
    setSaving(true);
    try {
      if (editEvent) {
        await updateItem(user.uid, COLLECTIONS.events, editEvent.id, form);
        show("Event updated");
      } else {
        await addItem(user.uid, COLLECTIONS.events, form);
        show("Event added");
      }
      setFormOpen(false);
      await load();
    } catch { show("Failed to save", "error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    await deleteItem(user.uid, COLLECTIONS.events, id);
    show("Event deleted");
    await load();
  };

  if (loading) return <LoadingState />;

  // Build calendar grid
  const cells: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrent(new Date(year, month - 1))} className="p-1.5 rounded hover:bg-[var(--muted)] transition-colors"><ChevronLeft size={16} /></button>
          <span className="text-sm font-semibold w-36 text-center">{MONTHS[month]} {year}</span>
          <button onClick={() => setCurrent(new Date(year, month + 1))} className="p-1.5 rounded hover:bg-[var(--muted)] transition-colors"><ChevronRight size={16} /></button>
          <button onClick={() => setCurrent(new Date())} className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] px-2 py-1 rounded hover:bg-[var(--muted)] transition-colors">Today</button>
        </div>
        <Button size="sm" onClick={() => openAdd(selected || today)}><Plus size={13} />Add Event</Button>
      </div>

      {/* Calendar grid */}
      <Card className="overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-[var(--border)]">
          {DAYS.map((d) => (
            <div key={d} className="py-2 text-center text-[10px] font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">{d}</div>
          ))}
        </div>
        {/* Cells */}
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            const key = day ? toKey(year, month, day) : "";
            const isToday = key === today;
            const isSelected = key === selected;
            const dayEvents = day ? (eventsByDate[key] || []) : [];
            return (
              <div
                key={i}
                onClick={() => day && setSelected(isSelected ? null : key)}
                className={`min-h-[64px] p-1.5 border-b border-r border-[var(--border)] cursor-pointer transition-colors ${!day ? "bg-[var(--muted)]/30 cursor-default" : isSelected ? "bg-[var(--secondary)]" : "hover:bg-[var(--muted)]/50"}`}
              >
                {day && (
                  <>
                    <span className={`inline-flex items-center justify-center w-6 h-6 text-xs font-medium rounded-full ${isToday ? "bg-[var(--accent)] text-white" : "text-[var(--foreground)]"}`}>
                      {day}
                    </span>
                    <div className="mt-0.5 space-y-0.5">
                      {dayEvents.slice(0, 2).map((e) => (
                        <div key={e.id} className={`text-[9px] px-1 py-0.5 rounded truncate ${catColor[e.category] || "bg-zinc-100 text-zinc-600"}`}>
                          {e.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && <div className="text-[9px] text-[var(--muted-foreground)]">+{dayEvents.length - 2}</div>}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Selected date events */}
      {selected && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">
              {new Date(selected + "T00:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
            </span>
            <Button size="sm" variant="ghost" onClick={() => openAdd(selected)}><Plus size={12} />Event</Button>
          </div>
          {selectedEvents.length === 0 ? (
            <Card className="p-4 text-center">
              <p className="text-sm text-[var(--muted-foreground)]">No events. <button onClick={() => openAdd(selected)} className="text-[var(--accent)] hover:underline">Add one</button></p>
            </Card>
          ) : (
            <div className="flex flex-col gap-2">
              {selectedEvents.map((e) => (
                <Card key={e.id} className="p-3 group flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[var(--foreground)]">{e.title}</span>
                      <Badge variant="default">{e.category}</Badge>
                    </div>
                    {(e.startTime || e.endTime) && (
                      <p className="text-xs font-mono text-[var(--muted-foreground)] mt-0.5">
                        {e.startTime}{e.endTime ? ` – ${e.endTime}` : ""}
                      </p>
                    )}
                    {e.notes && <p className="text-xs text-[var(--muted-foreground)] mt-1">{e.notes}</p>}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button onClick={() => openEdit(e)} className="p-1.5 rounded hover:bg-[var(--muted)] text-[var(--muted-foreground)]"><Pencil size={13} /></button>
                    <button onClick={() => setDeleteId(e.id)} className="p-1.5 rounded hover:bg-red-50 text-[var(--muted-foreground)] hover:text-red-600"><Trash2 size={13} /></button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {events.length === 0 && !selected && (
        <EmptyState icon={CalendarDays} title="No events yet." description="Add interviews, deadlines, and personal events." action={<Button size="sm" onClick={() => openAdd()}><Plus size={13} />Add Event</Button>} />
      )}

      {/* Form */}
      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editEvent ? "Edit Event" : "Add Event"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.title}>{saving ? "Saving…" : editEvent ? "Update" : "Add"}</Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-3">
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="col-span-2" required />
          <Input label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <Select label="Category" value={form.category} options={CATEGORIES} onChange={(e) => setForm({ ...form, category: e.target.value as CalendarEvent["category"] })} />
          <Input label="Start Time" type="time" value={form.startTime || ""} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
          <Input label="End Time" type="time" value={form.endTime || ""} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
          <Textarea label="Notes" value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="col-span-2" />
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => handleDelete(deleteId!)} title="Delete Event" message="Delete this event? This cannot be undone." />
      <Toast toast={toast} />
    </div>
  );
}
