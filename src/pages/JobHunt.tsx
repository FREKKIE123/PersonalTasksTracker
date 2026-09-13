import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, ExternalLink, Briefcase } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { getItems, addItem, updateItem, deleteItem, COLLECTIONS, orderBy } from "../lib/firestore";
import {
  Button, Card, Input, Textarea, Select, Badge, Modal, ConfirmDialog,
  EmptyState, LoadingState, StatCard, SectionHeader, SearchInput, useToast, Toast
} from "../components/ui";
import type { JobApplication } from "./types";

const STATUS_OPTIONS = [
  { value: "Applied", label: "Applied" },
  { value: "Under Review", label: "Under Review" },
  { value: "Assessment", label: "Assessment" },
  { value: "Interview", label: "Interview" },
  { value: "Offer", label: "Offer" },
  { value: "Rejected", label: "Rejected" },
  { value: "Withdrawn", label: "Withdrawn" },
];

const statusBadge: Record<string, "applied" | "review" | "assessment" | "interview" | "offer" | "rejected" | "withdrawn"> = {
  Applied: "applied",
  "Under Review": "review",
  Assessment: "assessment",
  Interview: "interview",
  Offer: "offer",
  Rejected: "rejected",
  Withdrawn: "withdrawn",
};

const EMPTY_FORM: Omit<JobApplication, "id" | "createdAt"> = {
  company: "", position: "", location: "", dateApplied: new Date().toISOString().split("T")[0],
  status: "Applied", url: "", contact: "", followUpDate: "", salary: "", notes: "",
};

export default function JobHunt() {
  const { user } = useAuth();
  const { toast, show } = useToast();
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortField] = useState<"dateApplied">("dateApplied");
  const [formOpen, setFormOpen] = useState(false);
  const [editJob, setEditJob] = useState<JobApplication | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!user) return;
    try {
      const data = await getItems<JobApplication>(user.uid, COLLECTIONS.jobs, orderBy("dateApplied", "desc"));
      setJobs(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [user]);

  const openAdd = () => { setForm({ ...EMPTY_FORM }); setEditJob(null); setFormOpen(true); };
  const openEdit = (j: JobApplication) => { setForm({ ...j }); setEditJob(j); setFormOpen(true); };

  const handleSave = async () => {
    if (!user || !form.company || !form.position) return;
    setSaving(true);
    try {
      if (editJob) {
        await updateItem(user.uid, COLLECTIONS.jobs, editJob.id, form);
        show("Application updated");
      } else {
        await addItem(user.uid, COLLECTIONS.jobs, form);
        show("Application added");
      }
      setFormOpen(false);
      await load();
    } catch {
      show("Failed to save", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    await deleteItem(user.uid, COLLECTIONS.jobs, id);
    show("Application deleted");
    await load();
  };

  const filtered = jobs
    .filter((j) => filterStatus === "All" || j.status === filterStatus)
    .filter((j) =>
      !search ||
      j.company.toLowerCase().includes(search.toLowerCase()) ||
      j.position.toLowerCase().includes(search.toLowerCase())
    );

  const stats = {
    total: jobs.length,
    active: jobs.filter((j) => !["Rejected", "Withdrawn", "Offer"].includes(j.status)).length,
    interviews: jobs.filter((j) => j.status === "Interview").length,
    offers: jobs.filter((j) => j.status === "Offer").length,
    rejections: jobs.filter((j) => j.status === "Rejected").length,
  };

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="Active" value={stats.active} />
        <StatCard label="Interviews" value={stats.interviews} />
        <StatCard label="Offers" value={stats.offers} />
        <StatCard label="Rejections" value={stats.rejections} />
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
        <SearchInput value={search} onChange={setSearch} placeholder="Search companies, positions…" />
        <div className="flex gap-2 shrink-0">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-8 px-2 text-sm bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          >
            <option value="All">All statuses</option>
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <Button onClick={openAdd} size="sm">
            <Plus size={13} />Add
          </Button>
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title={jobs.length === 0 ? "No applications yet." : "No results."}
          description={jobs.length === 0 ? "Start tracking your job search." : "Try a different search or filter."}
          action={jobs.length === 0 ? <Button size="sm" onClick={openAdd}><Plus size={13} />Add Application</Button> : undefined}
        />
      ) : (
        <Card>
          <div className="hidden sm:grid grid-cols-[1fr_1fr_100px_90px_80px] gap-3 px-4 py-2 border-b border-[var(--border)]">
            {["Company", "Position", "Date", "Status", ""].map((h) => (
              <span key={h} className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">{h}</span>
            ))}
          </div>
          {filtered.map((j, i) => (
            <div key={j.id} className={`group px-4 py-3 ${i < filtered.length - 1 ? "border-b border-[var(--border)]" : ""}`}>
              {/* Mobile layout */}
              <div className="sm:hidden flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--foreground)] truncate">{j.company}</p>
                  <p className="text-xs text-[var(--muted-foreground)] truncate">{j.position}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge variant={statusBadge[j.status] || "default"}>{j.status}</Badge>
                    <span className="text-[10px] font-mono text-[var(--muted-foreground)]">{j.dateApplied}</span>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => openEdit(j)} className="p-1.5 rounded hover:bg-[var(--muted)] text-[var(--muted-foreground)]"><Pencil size={13} /></button>
                  <button onClick={() => setDeleteId(j.id)} className="p-1.5 rounded hover:bg-red-50 text-[var(--muted-foreground)] hover:text-red-600"><Trash2 size={13} /></button>
                </div>
              </div>
              {/* Desktop layout */}
              <div className="hidden sm:grid grid-cols-[1fr_1fr_100px_90px_80px] gap-3 items-center">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--foreground)] truncate">{j.company}</p>
                  {j.location && <p className="text-xs text-[var(--muted-foreground)] truncate">{j.location}</p>}
                </div>
                <p className="text-sm text-[var(--foreground)] truncate">{j.position}</p>
                <span className="text-xs font-mono text-[var(--muted-foreground)]">{j.dateApplied}</span>
                <Badge variant={statusBadge[j.status] || "default"}>{j.status}</Badge>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                  {j.url && <a href={j.url} target="_blank" rel="noreferrer" className="p-1.5 rounded hover:bg-[var(--muted)] text-[var(--muted-foreground)]"><ExternalLink size={13} /></a>}
                  <button onClick={() => openEdit(j)} className="p-1.5 rounded hover:bg-[var(--muted)] text-[var(--muted-foreground)]"><Pencil size={13} /></button>
                  <button onClick={() => setDeleteId(j.id)} className="p-1.5 rounded hover:bg-red-50 text-[var(--muted-foreground)] hover:text-red-600"><Trash2 size={13} /></button>
                </div>
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* Form Modal */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editJob ? "Edit Application" : "Add Application"}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.company || !form.position}>
              {saving ? "Saving…" : editJob ? "Update" : "Add"}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input label="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required />
          <Input label="Position" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} required />
          <Input label="Location" value={form.location || ""} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <Input label="Date Applied" type="date" value={form.dateApplied} onChange={(e) => setForm({ ...form, dateApplied: e.target.value })} />
          <Select label="Status" value={form.status} options={STATUS_OPTIONS} onChange={(e) => setForm({ ...form, status: e.target.value as JobApplication["status"] })} />
          <Input label="Salary / Pay" value={form.salary || ""} onChange={(e) => setForm({ ...form, salary: e.target.value })} placeholder="e.g. BWP 35,000/mo" />
          <Input label="Application URL" value={form.url || ""} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..." />
          <Input label="Contact Person" value={form.contact || ""} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
          <Input label="Follow-up Date" type="date" value={form.followUpDate || ""} onChange={(e) => setForm({ ...form, followUpDate: e.target.value })} />
          <div className="sm:col-span-2">
            <Textarea label="Notes" value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} placeholder="Interview feedback, requirements, etc." />
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => handleDelete(deleteId!)}
        title="Delete Application"
        message="Are you sure you want to delete this application? This cannot be undone."
      />
      <Toast toast={toast} />
    </div>
  );
}
