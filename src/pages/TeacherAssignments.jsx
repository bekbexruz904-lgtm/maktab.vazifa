import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ClipboardList, Plus } from "lucide-react";
import { errorMessage, fetchAssignments } from "../api";
import { useAuth } from "../context/AuthContext";
import { Badge, Button, EmptyState, ErrorNote, ProgressBar, Spinner, SubjectIcon } from "../components/ui";
import AssignmentFormModal from "./AssignmentFormModal";
import { useToast } from "../components/Toast";

export default function TeacherAssignments() {
  const { user } = useAuth();
  const toast = useToast();
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [cls, setCls] = useState("all");

  useEffect(() => {
    fetchAssignments().then(setItems).catch((e) => setError(errorMessage(e)));
  }, []);

  const classNames = useMemo(() => [...new Set((items || []).map((a) => a.school_class_name))].sort(), [items]);
  const shown = (items || []).filter((a) => cls === "all" || a.school_class_name === cls);
  const toCheck = (items || []).reduce((s, a) => s + (a.submitted_count - a.graded_count), 0);

  if (error) return <ErrorNote>{error}</ErrorNote>;
  if (!items) return <Spinner />;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-extrabold sm:text-4xl">Vazifalar</h1>
        <Button onClick={() => setOpen(true)}><Plus size={18} /> Yangi vazifa</Button>
      </div>

      {classNames.length > 1 && (
        <div className="-mx-4 mt-6 overflow-x-auto px-4">
          <div className="flex w-max gap-2">
            {["all", ...classNames].map((c) => (
              <button key={c} onClick={() => setCls(c)} aria-pressed={cls === c}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${cls === c ? "border-brand bg-brand text-on-brand" : "border-line bg-surface hover:bg-brand-soft"}`}>
                {c === "all" ? "Hamma sinflar" : c}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 space-y-3">
        {shown.length === 0 && (
          <EmptyState
            icon={ClipboardList}
            title="Hali vazifa yo'q"
            hint="Birinchi vazifani qo'shing — o'quvchilar uni o'z sahifasida ko'radi."
            action={<Button onClick={() => setOpen(true)}><Plus size={18} /> Yangi vazifa</Button>}
          />
        )}
        {shown.map((a) => {
          const unchecked = a.submitted_count - a.graded_count;
          return (
            <Link key={a.id} to={`/assignment/${a.id}`} className="sheet flex items-start gap-3 transition hover:border-brand">
              <SubjectIcon subject={a.subject} size={44} />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted">{a.subject || "Vazifa"}</p>
                    <h3 className="mt-0.5 text-lg font-bold leading-snug">{a.title}</h3>
                  </div>
                  <Badge>{a.school_class_name}</Badge>
                </div>
                <div className="mt-3"><ProgressBar value={a.submitted_count} max={a.total_students} tone={a.submitted_count === a.total_students && a.total_students ? "ok" : "brand"} /></div>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="text-muted">{a.submitted_count} / {a.total_students} topshirdi</span>
                  <div className="flex items-center gap-2">
                    {unchecked > 0 && <Badge tone="pen">{unchecked} ta tekshirilmagan</Badge>}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {open && (
        <AssignmentFormModal
          onClose={() => setOpen(false)}
          onCreated={(created) => {
            setItems((prev) => [{ ...created, total_students: created.total_students ?? 0, submitted_count: 0, graded_count: 0 }, ...prev]);
            setOpen(false);
            toast("Vazifa qo'shildi");
            // statistikani serverdan yangilaymiz (o'quvchilar soni)
            fetchAssignments().then(setItems).catch(() => {});
          }}
        />
      )}
    </div>
  );
}
