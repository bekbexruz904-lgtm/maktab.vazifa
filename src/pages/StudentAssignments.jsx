import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpenCheck, ChevronRight } from "lucide-react";
import { fetchAssignments, errorMessage } from "../api";
import { useAuth } from "../context/AuthContext";
import { Badge, EmptyState, ErrorNote, Spinner, SubjectIcon } from "../components/ui";
import GradeMark from "../components/GradeMark";

const isWaiting = (a) => a.status === "pending" || a.status === "overdue";

function StatusBadge({ status }) {
  if (status === "submitted") return <Badge tone="warn">Tekshirilmoqda</Badge>;
  if (status === "overdue") return <Badge tone="pen">Topshirilmagan</Badge>;
  if (status === "pending") return <Badge>Kutilmoqda</Badge>;
  return null;
}

export default function StudentAssignments() {
  const { user } = useAuth();
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState(null);

  useEffect(() => {
    fetchAssignments().then(setItems).catch((e) => setError(errorMessage(e)));
  }, []);

  const groups = useMemo(() => {
    const list = items || [];
    return {
      waiting: list.filter(isWaiting),
      submitted: list.filter((a) => a.status === "submitted"),
      graded: list.filter((a) => a.status === "graded"),
      all: list,
    };
  }, [items]);

  const avg = useMemo(() => {
    const g = groups.graded.map((a) => a.my_submission.grade);
    return g.length ? (g.reduce((s, v) => s + v, 0) / g.length).toFixed(1) : null;
  }, [groups]);

  if (error) return <ErrorNote>{error}</ErrorNote>;
  if (!items) return <Spinner />;

  const active = tab || (groups.waiting.length ? "waiting" : "all");
  const shown = [...groups[active]].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const tabs = [
    ["waiting", "Kutilmoqda"],
    ["submitted", "Topshirilgan"],
    ["graded", "Baholangan"],
    ["all", "Hammasi"],
  ];

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-extrabold sm:text-4xl">Vazifalar</h1>

      <div className="-mx-4 mt-4 overflow-x-auto px-4">
        <div className="flex w-max gap-2">
          {tabs.map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              aria-pressed={active === id}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                active === id ? "border-brand bg-brand text-on-brand" : "border-line bg-surface hover:bg-brand-soft"
              }`}
            >
              {label} <span className="opacity-70">{groups[id].length}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {shown.length === 0 && (
          <EmptyState
            icon={BookOpenCheck}
            title={items.length ? "Bu bo'limda vazifa yo'q" : "Hozircha vazifa berilmagan"}
            hint={items.length ? undefined : "Ustoz vazifa qo'shganda, shu yerda ko'rinadi."}
          />
        )}
        {shown.map((a) => (
          <Link key={a.id} to={`/assignment/${a.id}`} className="sheet flex items-start gap-3 transition hover:border-brand">
            <SubjectIcon subject={a.subject} size={44} />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-muted">{a.subject || "Vazifa"} · {a.teacher_name}</p>
              <h3 className="mt-0.5 text-lg font-bold leading-snug">{a.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted">{a.description}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <StatusBadge status={a.status} />
              </div>
            </div>
            {a.status === "graded" ? <GradeMark value={a.my_submission.grade} /> : <ChevronRight className="mt-1 shrink-0 text-muted" size={20} />}
          </Link>
        ))}
      </div>
    </div>
  );
}
