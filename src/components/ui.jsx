import { useEffect, useRef } from "react";
import { BookOpen, Loader2, X } from "lucide-react";
import { initials, subjectTone } from "../utils";

const BTN = {
  primary: "bg-brand text-on-brand shadow-sm shadow-brand/25 hover:opacity-90",
  secondary: "border border-line bg-surface text-ink hover:bg-brand-soft",
  ghost: "text-muted hover:bg-brand-soft hover:text-ink",
  danger: "border border-pen/40 text-pen hover:bg-pen-soft",
};
const SIZE = { md: "h-12 px-5 text-[15px]", sm: "h-9 px-3 text-sm" };

export function Button({ variant = "primary", size = "md", loading, className = "", children, ...rest }) {
  return (
    <button
      {...rest}
      disabled={rest.disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${BTN[variant]} ${SIZE[size]} ${className}`}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  );
}

const BADGE = {
  neutral: "bg-brand-soft text-brand",
  ok: "bg-ok-soft text-ok",
  warn: "bg-warn-soft text-warn",
  pen: "bg-pen-soft text-pen",
};
export function Badge({ tone = "neutral", children, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${BADGE[tone]} ${className}`}>
      {children}
    </span>
  );
}

export function Spinner({ label = "Yuklanmoqda..." }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-muted" role="status">
      <Loader2 className="animate-spin" size={20} /> {label}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, hint, action }) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-surface/70 px-6 py-12 text-center">
      {Icon && <Icon size={32} className="mx-auto mb-3 text-muted" />}
      <p className="font-display text-lg font-semibold">{title}</p>
      {hint && <p className="mx-auto mt-1 max-w-sm text-sm text-muted">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function ErrorNote({ children }) {
  if (!children) return null;
  return (
    <p className="rounded-lg bg-pen-soft px-3 py-2 text-sm font-medium text-pen" role="alert">
      {children}
    </p>
  );
}

export function Avatar({ name, size = 36 }) {
  return (
    <span
      style={{ width: size, height: size }}
      className="grid shrink-0 place-items-center rounded-full bg-brand-soft text-xs font-bold text-brand"
    >
      {initials(name)}
    </span>
  );
}

const SUBJECT_ICON_TONE = {
  ok: "bg-ok-soft text-ok",
  brand: "bg-brand-soft text-brand",
  warn: "bg-warn-soft text-warn",
  pen: "bg-pen-soft text-pen",
};

/** Rasmdagi kabi fan bo'yicha rangli dumaloq ikonka (Matematika, Ona tili, Tarix ...) */
export function SubjectIcon({ subject, icon: Icon = BookOpen, size = 40 }) {
  const tone = subjectTone(subject || "");
  return (
    <span
      style={{ width: size, height: size }}
      className={`grid shrink-0 place-items-center rounded-xl ${SUBJECT_ICON_TONE[tone]}`}
    >
      <Icon size={Math.round(size * 0.5)} />
    </span>
  );
}

export function ProgressBar({ value, max, tone = "brand" }) {
  const pct = max ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="h-2.5 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuenow={value} aria-valuemax={max}>
      <div className={`h-full rounded-full transition-all ${tone === "ok" ? "bg-ok" : "bg-brand"}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

/** Telefonda pastdan chiqadigan, kompyuterda markazdagi oyna */
export function Modal({ title, onClose, children, wide = false }) {
  const ref = useRef(null);
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`animate-sheet-up flex max-h-[92vh] w-full flex-col rounded-t-2xl border border-line bg-surface shadow-xl outline-none sm:rounded-2xl ${wide ? "sm:max-w-3xl" : "sm:max-w-lg"}`}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-2 text-muted hover:bg-brand-soft" aria-label="Yopish">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmDialog({ title, text, confirmLabel, loading, onConfirm, onClose }) {
  return (
    <Modal title={title} onClose={onClose}>
      <p className="text-sm text-muted">{text}</p>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>Bekor qilish</Button>
        <Button variant="danger" loading={loading} onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </Modal>
  );
}
