import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Award, Bell, ClipboardList, User as UserIcon, Plus } from "lucide-react";
import { errorMessage, fetchAssignments } from "../api";
import { useAuth } from "../context/AuthContext";
import { Button, EmptyState, ErrorNote, ProgressBar, Spinner, SubjectIcon } from "../components/ui";
import { useUnread } from "../context/NotificationContext";
import AssignmentFormModal from "./AssignmentFormModal";
import { useToast } from "../components/Toast";

export default function TeacherHome() {
  const { user } = useAuth();
  const { count } = useUnread();
  const toast = useToast();
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  const load = () => fetchAssignments().then(setItems).catch((e) => setError(errorMessage(e)));
  useEffect(() => { load(); }, []);

  const stats = useMemo(() => {
    const list = items || [];
    const submitted = list.reduce((s, a) => s + a.submitted_count, 0);
    const graded = list.reduce((s, a) => s + a.graded_count, 0);
    const total = list.reduce((s, a) => s + a.total_students, 0);
    return { given: list.length, submitted, unchecked: submitted - graded, pct: submitted ? Math.round((graded / submitted) * 100) : 0, total };
  }, [items]);

  const next = useMemo(() => {
    return [...(items || [])].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
  }, [items]);

  if (error) return <div className="mx-auto max-w-3xl"><ErrorNote>{error}</ErrorNote></div>;
  if (!items) return <Spinner />;

  const quick = [
    [() => setOpen(true), Plus, "Yangi vazifa", null],
    ["/vazifalar", ClipboardList, "Vazifalar", null],
    ["/xabarnomalar", Bell, "Xabarlar", count],
    ["/profil", UserIcon, "Profil", null],
  ];

  return (
    <div className="mx-auto max-w-3xl">
      <div className="-mx-4 -mt-6 rounded-b-3xl bg-brand px-4 pb-6 pt-8 text-on-brand sm:mx-0 sm:mt-0 sm:rounded-2xl sm:p-6">
        <p className="text-sm text-on-brand/75">Assalomu alaykum,</p>
        <h1 className="mt-0.5 font-display text-2xl font-extrabold sm:text-3xl">{user.full_name}</h1>

        <div className="mt-5 rounded-2xl bg-white p-4 text-ink shadow-lg">
          <div className="flex items-center justify-between">
            <p className="font-semibold">Bugungi ish</p>
            {stats.unchecked > 0 && <span className="rounded-md bg-pen-soft px-2 py-0.5 text-xs font-bold text-pen">Tekshiruv kutilmoqda</span>}
          </div>
          <p className="mt-1 text-lg font-bold leading-snug">
            {stats.unchecked > 0 ? `${stats.unchecked} ta ish tekshirilishini kutmoqda` : "Hamma ish tekshirilgan"}
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div><p className="font-display text-xl font-extrabold">{stats.given}</p><p className="text-xs text-muted">Berilgan vazifa</p></div>
            <div><p className="font-display text-xl font-extrabold">{stats.submitted}</p><p className="text-xs text-muted">Topshirilgan</p></div>
            <div><p className="font-display text-xl font-extrabold text-pen">{stats.unchecked}</p><p className="text-xs text-muted">Tekshirilmagan</p></div>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-muted">Tekshirilgan</span>
            <span className="font-display text-lg font-extrabold text-ok">{stats.pct}%</span>
          </div>
          <div className="mt-1"><ProgressBar value={stats.pct} max={100} tone="ok" /></div>
          {stats.unchecked > 0 && (
            <Link to="/vazifalar" className="mt-3 flex h-12 w-full items-center justify-center rounded-xl bg-brand font-semibold text-on-brand shadow-sm shadow-brand/25">
              Tekshirishni boshlash
            </Link>
          )}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-4 gap-2">
        {quick.map(([to, Icon, label, badge], i) => {
          const content = (
            <>
              {badge > 0 && <span className="absolute right-3 top-2 grid h-4 min-w-[16px] place-items-center rounded-full bg-pen px-1 text-[10px] font-bold text-white">{badge}</span>}
              <Icon size={20} className="text-brand" /> {label}
            </>
          );
          const cls = "relative flex flex-col items-center gap-1.5 rounded-xl border border-line bg-surface py-3 text-xs font-semibold hover:bg-brand-soft";
          return typeof to === "string" ? (
            <Link key={i} to={to} className={cls}>{content}</Link>
          ) : (
            <button key={i} onClick={to} className={cls}>{content}</button>
          );
        })}
      </div>

      {next && (
        <div className="mt-5 rounded-xl border border-line bg-surface p-4">
          <p className="mb-2 text-sm font-semibold">So'nggi vazifa</p>
          <Link to={`/assignment/${next.id}`} className="flex items-center gap-3 rounded-lg border border-line p-3 hover:border-brand">
            <SubjectIcon subject={next.subject} icon={ClipboardList} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{next.title}</p>
              <p className="text-xs text-muted">{next.subject} · {next.school_class_name}</p>
              <div className="mt-1.5"><ProgressBar value={next.submitted_count} max={next.total_students} /></div>
            </div>
          </Link>
        </div>
      )}

      {items.length === 0 && (
        <div className="mt-5">
          <EmptyState icon={ClipboardList} title="Hali vazifa yo'q" hint="Birinchi vazifani qo'shing." action={<Button onClick={() => setOpen(true)}><Plus size={18} /> Yangi vazifa</Button>} />
        </div>
      )}

      {open && (
        <AssignmentFormModal
          onClose={() => setOpen(false)}
          onCreated={() => { setOpen(false); toast("Vazifa qo'shildi"); load(); }}
        />
      )}
    </div>
  );
}
