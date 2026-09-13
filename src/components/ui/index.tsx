import { type ButtonHTMLAttributes, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes, type ReactNode, useState } from "react";
import { X, AlertTriangle, Check } from "lucide-react";

// ─── Button ───────────────────────────────────────────────────────────────────
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export function Button({ variant = "primary", size = "md", className = "", children, ...props }: ButtonProps) {
  const base = "inline-flex items-center justify-center gap-1.5 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:opacity-50 disabled:pointer-events-none rounded-[var(--radius)]";
  const variants = {
    primary: "bg-[var(--primary)] text-white hover:bg-[#17483F]",
    secondary: "bg-[var(--secondary)] text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--muted)]",
    ghost: "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]",
    danger: "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100",
  };
  const sizes = { sm: "h-7 px-2.5 text-xs", md: "h-8 px-3 text-sm", lg: "h-10 px-4 text-sm" };
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)] ${className}`}>
      {children}
    </div>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = "", id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1">
      {label && <label htmlFor={inputId} className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide">{label}</label>}
      <input
        id={inputId}
        className={`h-8 px-3 text-sm bg-[var(--card)] border rounded-[var(--radius)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-shadow ${error ? "border-red-400" : "border-[var(--border)]"} ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}

// ─── Textarea ─────────────────────────────────────────────────────────────────
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function Textarea({ label, className = "", id, ...props }: TextareaProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1">
      {label && <label htmlFor={inputId} className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide">{label}</label>}
      <textarea
        id={inputId}
        className={`px-3 py-2 text-sm bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-shadow resize-none ${className}`}
        {...props}
      />
    </div>
  );
}

// ─── Select ───────────────────────────────────────────────────────────────────
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, options, className = "", id, ...props }: SelectProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1">
      {label && <label htmlFor={inputId} className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide">{label}</label>}
      <select
        id={inputId}
        className={`h-8 px-3 text-sm bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-shadow appearance-none ${className}`}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
type BadgeVariant = "default" | "applied" | "review" | "assessment" | "interview" | "offer" | "rejected" | "withdrawn" | "planned" | "inprogress" | "completed" | "paused" | "win" | "loss" | "breakeven";

const badgeStyles: Record<BadgeVariant, string> = {
  default: "bg-[var(--muted)] text-[var(--muted-foreground)]",
  applied: "bg-blue-50 text-blue-700",
  review: "bg-amber-50 text-amber-700",
  assessment: "bg-purple-50 text-purple-700",
  interview: "bg-[#E8F2F0] text-[#1F5C52]",
  offer: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-600",
  withdrawn: "bg-zinc-100 text-zinc-500",
  planned: "bg-zinc-100 text-zinc-600",
  inprogress: "bg-blue-50 text-blue-700",
  completed: "bg-green-50 text-green-700",
  paused: "bg-amber-50 text-amber-700",
  win: "bg-green-50 text-green-700",
  loss: "bg-red-50 text-red-600",
  breakeven: "bg-zinc-100 text-zinc-500",
};

export function Badge({ variant = "default", children }: { variant?: BadgeVariant; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium tracking-wide ${badgeStyles[variant]}`}>
      {children}
    </span>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}

export function Modal({ open, onClose, title, children, footer, size = "md" }: ModalProps) {
  if (!open) return null;
  const widths = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl" };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
      <div
        className={`relative z-10 w-full ${widths[size]} bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-xl flex flex-col max-h-[90vh]`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">{title}</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-[var(--muted)] text-[var(--muted-foreground)] transition-colors">
            <X size={14} />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4 flex-1">{children}</div>
        {footer && (
          <div className="px-5 py-3 border-t border-[var(--border)] flex justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ConfirmDialog ─────────────────────────────────────────────────────────────
interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = "Delete" }: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="danger" onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</Button>
        </>
      }
    >
      <div className="flex gap-3">
        <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
        <p className="text-sm text-[var(--muted-foreground)]">{message}</p>
      </div>
    </Modal>
  );
}

// ─── EmptyState ────────────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description, action }: {
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
      {Icon && <Icon size={24} className="text-[var(--muted-foreground)]" />}
      <div>
        <p className="text-sm font-medium text-[var(--foreground)]">{title}</p>
        {description && <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{description}</p>}
      </div>
      {action}
    </div>
  );
}

// ─── LoadingState ─────────────────────────────────────────────────────────────
export function LoadingState() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-5 h-5 border-2 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin" />
    </div>
  );
}

// ─── ProgressBar ─────────────────────────────────────────────────────────────
export function ProgressBar({ value, max = 100, className = "" }: { value: number; max?: number; className?: string }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={`h-1.5 bg-[var(--muted)] rounded-full overflow-hidden ${className}`}>
      <div className="h-full bg-[var(--accent)] rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
    </div>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="flex flex-col gap-1 p-4 bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)]">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">{label}</span>
      <span className="text-2xl font-semibold text-[var(--foreground)] font-mono leading-none">{value}</span>
      {sub && <span className="text-xs text-[var(--muted-foreground)]">{sub}</span>}
    </div>
  );
}

// ─── SectionHeader ────────────────────────────────────────────────────────────
export function SectionHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">{title}</h2>
      {action}
    </div>
  );
}

// ─── Toggle (checkbox-like) ───────────────────────────────────────────────────
export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
      <button
        role="checkbox"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`w-8 h-4 rounded-full transition-colors ${checked ? "bg-[var(--accent)]" : "bg-[var(--border)]"} relative`}
      >
        <span className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-4" : "translate-x-0"}`} />
      </button>
      {label && <span className="text-sm text-[var(--foreground)]">{label}</span>}
    </label>
  );
}

// ─── CheckItem ────────────────────────────────────────────────────────────────
export function CheckItem({ checked, onToggle, label, sub }: { checked: boolean; onToggle: () => void; label: string; sub?: string }) {
  return (
    <button onClick={onToggle} className="flex items-start gap-3 text-left w-full group hover:bg-[var(--muted)] px-2 py-1.5 rounded transition-colors">
      <span className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${checked ? "bg-[var(--accent)] border-[var(--accent)]" : "border-[var(--border)] group-hover:border-[var(--muted-foreground)]"}`}>
        {checked && <Check size={10} color="white" strokeWidth={3} />}
      </span>
      <span className="flex-1">
        <span className={`text-sm ${checked ? "line-through text-[var(--muted-foreground)]" : "text-[var(--foreground)]"}`}>{label}</span>
        {sub && <span className="block text-xs text-[var(--muted-foreground)]">{sub}</span>}
      </span>
    </button>
  );
}

// ─── SearchInput ─────────────────────────────────────────────────────────────
export function SearchInput({ value, onChange, placeholder = "Search..." }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-8 pl-8 pr-3 text-sm bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] w-full transition-shadow"
      />
      <svg className="absolute left-2.5 top-2 w-4 h-4 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
      </svg>
    </div>
  );
}

// ─── Toast (simple) ──────────────────────────────────────────────────────────
export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const show = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };
  return { toast, show };
}

export function Toast({ toast }: { toast: { message: string; type: "success" | "error" } | null }) {
  if (!toast) return null;
  return (
    <div className={`fixed bottom-4 right-4 z-50 px-4 py-2.5 rounded-[var(--radius)] text-sm text-white shadow-lg flex items-center gap-2 ${toast.type === "success" ? "bg-[var(--accent)]" : "bg-red-600"}`}>
      {toast.type === "success" ? <Check size={14} /> : <AlertTriangle size={14} />}
      {toast.message}
    </div>
  );
}
