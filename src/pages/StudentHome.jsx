import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, BookOpenCheck, Flame } from "lucide-react";
import { errorMessage, fetchAssignments, fetchMyStats } from "../api";
import { useAuth } from "../context/AuthContext";
import { EmptyState, ProgressBar, SubjectIcon, Spinner, ErrorNote } from "../components/ui";
import { useUnread } from "../context/NotificationContext";
import { dayBucket, formatTime } from "../utils";

function AssignmentRow({ a }) {
  const graded = a.status === "graded";
  const submitted = a.status === "submitted";
  return (
    <Link
      to={`/assignment/${a.id}`}
      className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3 transition hover:border-brand"
    >
      <SubjectIcon subject={a.subject} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold leading-snug">{a.subject || "Vazifa"}</p>
        <p className="truncate text-xs text-muted">{a.title}</p>
      </div>
      <div className="shrink-0 text-right">
        {a.due_date && <p className="text-xs text-muted">{formatTime(a.due_date)}</p>}
        <p
          className={`mt-0.5 text-xs font-bold ${
            graded ? "text-ok" : submitted ? "text-warn" : "text-brand"
          }`}
        >
          {graded ? "Baholandi" : submitted ? "Kutilmoqda" : "Bajarilmagan"}
        </p>
      </div>
    </Link>
  );
}

export default function StudentHome() {
  const { user } = useAuth();
  const { count } = useUnread();
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchAssignments().then(setItems).catch((e) => setError(errorMessage(e)));
    fetchMyStats().then(setStats).catch(() => {});
  }, []);

  const groups = useMemo(() => {
    const list = items || [];
    return {
      waiting: list.filter((a) => a.status === "pending" || a.status === "overdue"),
      submitted: list.filter((a) => a.status === "submitted"),
      graded: list.filter((a) => a.status === "graded"),
      all: list,
    };
  }, [items]);

  const byDay = useMemo(() => {
    const list = [...(items || [])].sort((a, b) => new Date(a.due_date || a.created_at) - new Date(b.due_date || b.created_at));
    return {
      today: list.filter((a) => dayBucket(a.due_date) === "today" || (dayBucket(a.due_date) === "none" && (a.status === "pending" || a.status === "overdue"))),
      tomorrow: list.filter((a) => dayBucket(a.due_date) === "tomorrow"),
    };
  }, [items]);

  const donePct = items?.length
    ? Math.round(((groups.submitted.length + groups.graded.length) / items.length) * 100)
    : 0;
  const doneCount = groups.submitted.length + groups.graded.length;

  if (error) return <div className="mx-auto max-w-3xl"><ErrorNote>{error}</ErrorNote></div>;
  if (!items) return <Spinner />;

  return (
    <div className="mx-auto max-w-3xl">
      {/* Ko'k sarlavha karta */}
      <div className="-mx-4 -mt-6 rounded-b-3xl bg-brand px-4 pb-6 pt-8 text-on-brand sm:mx-0 sm:mt-0 sm:rounded-2xl sm:p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-on-brand/75">Assalomu alaykum,</p>
            <h1 className="mt-0.5 font-display text-2xl font-extrabold sm:text-3xl">{user.full_name}</h1>
            <p className="mt-1 text-sm text-on-brand/75">{user.school_class_name || "Sinf tayinlanmagan"}</p>
          </div>
          <Link
            to="/xabarnomalar"
            className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/15 text-on-brand hover:bg-white/25"
            aria-label="Xabarnomalar"
          >
            <Bell size={18} />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 grid h-4 min-w-[16px] place-items-center rounded-full bg-pen px-1 text-[10px] font-bold text-white">
                {count > 9 ? "9+" : count}
              </span>
            )}
          </Link>
        </div>

        {/* Bugungi maqsad */}
        <div className="mt-5 rounded-2xl bg-white p-4 text-ink shadow-lg">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-muted">Bugungi maqsad</p>
            <span className="rounded-md bg-brand-soft px-2 py-0.5 text-xs font-bold text-brand">
              {doneCount} / {items.length} vazifa
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-muted">Bajarilgan</span>
            <span className="font-display text-lg font-extrabold text-brand">{donePct}%</span>
          </div>
          <div className="mt-1.5"><ProgressBar value={donePct} max={100} /></div>
        </div>
      </div>

      {stats && (
        <Link to="/yutuqlar" className="mt-4 flex items-center gap-3 rounded-2xl bg-warn-soft p-3">
          <Flame size={28} className="text-pen" />
          <div>
            <p className="font-bold">{stats.streak} kunlik streak</p>
            <p className="text-xs text-muted">Ketma-ket kun vazifa topshiring</p>
          </div>
        </Link>
      )}

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        {[[items.length, "Vazifalar"], [doneCount, "Bajarildi"], [groups.waiting.length, "Kutilmoqda"]].map(([v, l]) => (
          <div key={l} className="rounded-xl border border-line bg-surface p-2">
            <p className="font-display text-xl font-extrabold">{v}</p>
            <p className="text-xs text-muted">{l}</p>
          </div>
        ))}
      </div>

      {/* Bugungi vazifalar */}
      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-semibold">Bugungi vazifalar</p>
          <Link to="/vazifalar" className="text-xs font-semibold text-brand">Barchasi</Link>
        </div>
        {byDay.today.length ? (
          <div className="space-y-2">{byDay.today.map((a) => <AssignmentRow key={a.id} a={a} />)}</div>
        ) : (
          <div className="rounded-xl border border-line bg-surface p-4 text-center text-sm text-muted">
            Bugunga vazifa yo'q. Barakalla! 🎉
          </div>
        )}
      </div>

      {/* Ertaga */}
      {byDay.tomorrow.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 text-sm font-semibold">Ertaga</p>
          <div className="space-y-2">{byDay.tomorrow.map((a) => <AssignmentRow key={a.id} a={a} />)}</div>
        </div>
      )}

      {items.length === 0 && (
        <div className="mt-5">
          <EmptyState icon={BookOpenCheck} title="Hozircha vazifa berilmagan" hint="Ustoz vazifa qo'shganda, shu yerda ko'rinadi." />
        </div>
      )}
    </div>
  );
}
