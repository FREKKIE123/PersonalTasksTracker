import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Award, ExternalLink } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { getItems, addItem, updateItem, deleteItem, COLLECTIONS } from "../lib/firestore";
import {
  Button, Card, Input, Textarea, Select, Badge, Modal, ConfirmDialog,
  EmptyState, LoadingState, ProgressBar, useToast, Toast, SectionHeader
} from "../components/ui";
import type { Certification } from "./types";

const STATUS_OPTIONS = [
  { value: "Planned", label: "Planned" },
  { value: "In Progress", label: "In Progress" },
  { value: "Completed", label: "Completed" },
  { value: "Paused", label: "Paused" },
];

const statusBadge: Record<string, "planned" | "inprogress" | "completed" | "paused"> = {
  Planned: "planned",
  "In Progress": "inprogress",
  Completed: "completed",
  Paused: "paused",
};

const EMPTY: Omit<Certification, "id" | "createdAt"> = {
  name: "", provider: "", code: "", status: "Planned", progress: 0,
  startDate: "", targetDate: "", completedDate: "", examDate: "", certUrl: "", notes: "",
};

export default function Certifications() {
  const { user } = useAuth();
  const { toast, show } = useToast();
  const [certs, setCerts] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editCert, setEditCert] = useState<Certification | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!user) return;
    try {
      const data = await getItems<Certification>(user.uid, COLLECTIONS.certs);
      setCerts(data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [user]);

  const openAdd = () => { setForm({ ...EMPTY }); setEditCert(null); setFormOpen(true); };
  const openEdit = (c: Certification) => { setForm({ ...c }); setEditCert(c); setFormOpen(true); };

  const handleSave = async () => {
    if (!user || !form.name) return;
    setSaving(true);
    try {
      const data = { ...form, progress: Number(form.progress) };
      if (editCert) {
        await updateItem(user.uid, COLLECTIONS.certs, editCert.id, data);
        show("Certification updated");
      } else {
        await addItem(user.uid, COLLECTIONS.certs, data);
        show("Certification added");
      }
      setFormOpen(false);
      await load();
    } catch { show("Failed to save", "error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    await deleteItem(user.uid, COLLECTIONS.certs, id);
    show("Certification removed");
    await load();
  };

  const inProgress = certs.filter((c) => c.status === "In Progress");
  const completed = certs.filter((c) => c.status === "Completed");
  const planned = certs.filter((c) => c.status === "Planned");
  const paused = certs.filter((c) => c.status === "Paused");

  if (loading) return <LoadingState />;

  const Section = ({ title, items }: { title: string; items: Certification[] }) => (
    items.length > 0 ? (
      <div>
        <SectionHeader title={title} action={<Button size="sm" variant="ghost" onClick={openAdd}><Plus size={12} /></Button>} />
        <div className="flex flex-col gap-3">
          {items.map((c) => (
            <Card key={c.id} className="p-4 group">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-[var(--foreground)]">{c.name}</span>
                    {c.code && <span className="text-xs font-mono text-[var(--muted-foreground)]">{c.code}</span>}
                    <Badge variant={statusBadge[c.status]}>{c.status}</Badge>
                  </div>
                  {c.provider && <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{c.provider}</p>}

                  {c.status !== "Completed" && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-[var(--muted-foreground)]">Progress</span>
                        <span className="text-xs font-mono font-medium text-[var(--foreground)]">{c.progress}%</span>
                      </div>
                      <ProgressBar value={c.progress} />
                    </div>
                  )}

                  <div className="flex gap-4 mt-2 text-xs text-[var(--muted-foreground)]">
                    {c.targetDate && <span>Target: <span className="font-mono">{c.targetDate}</span></span>}
                    {c.examDate && <span>Exam: <span className="font-mono">{c.examDate}</span></span>}
                    {c.completedDate && <span>Completed: <span className="font-mono">{c.completedDate}</span></span>}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  {c.certUrl && <a href={c.certUrl} target="_blank" rel="noreferrer" className="p-1.5 rounded hover:bg-[var(--muted)] text-[var(--muted-foreground)]"><ExternalLink size={13} /></a>}
                  <button onClick={() => openEdit(c)} className="p-1.5 rounded hover:bg-[var(--muted)] text-[var(--muted-foreground)]"><Pencil size={13} /></button>
                  <button onClick={() => setDeleteId(c.id)} className="p-1.5 rounded hover:bg-red-50 text-[var(--muted-foreground)] hover:text-red-600"><Trash2 size={13} /></button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    ) : null
  );

  return (
    <div className="space-y-8">
      {/* Summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "In Progress", value: inProgress.length },
          { label: "Completed", value: completed.length },
          { label: "Planned", value: planned.length },
          { label: "Paused", value: paused.length },
        ].map(({ label, value }) => (
          <div key={label} className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)] p-3 text-center">
            <div className="text-xl font-semibold font-mono">{value}</div>
            <div className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)]">{label}</div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button size="sm" onClick={openAdd}><Plus size={13} />Add Certification</Button>
      </div>

      {certs.length === 0 ? (
        <EmptyState icon={Award} title="No certifications yet." description="Start tracking your learning journey." action={<Button size="sm" onClick={openAdd}><Plus size={13} />Add Certification</Button>} />
      ) : (
        <div className="space-y-8">
          <Section title="In Progress" items={inProgress} />
          <Section title="Planned" items={planned} />
          <Section title="Completed" items={completed} />
          <Section title="Paused" items={paused} />
        </div>
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editCert ? "Edit Certification" : "Add Certification"} size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.name}>{saving ? "Saving…" : editCert ? "Update" : "Add"}</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input label="Certification Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="sm:col-span-2" />
          <Input label="Provider" value={form.provider || ""} onChange={(e) => setForm({ ...form, provider: e.target.value })} placeholder="e.g. Microsoft" />
          <Input label="Code / Exam ID" value={form.code || ""} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g. AZ-900" />
          <Select label="Status" value={form.status} options={STATUS_OPTIONS} onChange={(e) => setForm({ ...form, status: e.target.value as Certification["status"] })} />
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide">Progress ({form.progress}%)</label>
            <input type="range" min={0} max={100} value={form.progress} onChange={(e) => setForm({ ...form, progress: Number(e.target.value) })} className="accent-[var(--accent)]" />
          </div>
          <Input label="Start Date" type="date" value={form.startDate || ""} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
          <Input label="Target Date" type="date" value={form.targetDate || ""} onChange={(e) => setForm({ ...form, targetDate: e.target.value })} />
          <Input label="Exam Date" type="date" value={form.examDate || ""} onChange={(e) => setForm({ ...form, examDate: e.target.value })} />
          <Input label="Completed Date" type="date" value={form.completedDate || ""} onChange={(e) => setForm({ ...form, completedDate: e.target.value })} />
          <Input label="Certificate URL" value={form.certUrl || ""} onChange={(e) => setForm({ ...form, certUrl: e.target.value })} placeholder="https://..." className="sm:col-span-2" />
          <Textarea label="Notes" value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="sm:col-span-2" />
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => handleDelete(deleteId!)} title="Remove Certification" message="Remove this certification from your tracker?" />
      <Toast toast={toast} />
    </div>
  );
}
