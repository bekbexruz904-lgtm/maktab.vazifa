import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { errorMessage, fetchAssignments } from "../api";
import { ErrorNote, Spinner, SubjectIcon } from "../components/ui";
import { formatTime } from "../utils";

const MONTHS = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];
const WEEK = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];
const key = (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

export default function CalendarPage() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  const now = new Date();
  const [cur, setCur] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [sel, setSel] = useState(now);

  useEffect(() => {
    fetchAssignments().then(setItems).catch((e) => setError(errorMessage(e)));
  }, []);

  const byDay = useMemo(() => {
    const m = {};
    (items || []).forEach((a) => {
      if (!a.due_date) return;
      const k = key(new Date(a.due_date));
      (m[k] = m[k] || []).push(a);
    });
    return m;
  }, [items]);

  if (error) return <div className="mx-auto max-w-3xl"><ErrorNote>{error}</ErrorNote></div>;
  if (!items) return <Spinner />;

  const offset = (cur.getDay() + 6) % 7;
  const days = new Date(cur.getFullYear(), cur.getMonth() + 1, 0).getDate();
  const cells = [...Array(offset).fill(null), ...Array.from({ length: days }, (_, i) => new Date(cur.getFullYear(), cur.getMonth(), i + 1))];
  const list = byDay[key(sel)] || [];
  const move = (n) => setCur(new Date(cur.getFullYear(), cur.getMonth() + n, 1));

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-extrabold sm:text-4xl">Kalendar</h1>
      <div className="mt-5 rounded-2xl border border-line bg-surface p-4">
        <div className="mb-3 flex items-center justify-between">
          <button onClick={() => move(-1)} className="rounded-lg p-2 hover:bg-brand-soft" aria-label="Oldingi oy"><ChevronLeft size={18} /></button>
          <p className="font-semibold">{MONTHS[cur.getMonth()]} {cur.getFullYear()}</p>
          <button onClick={() => move(1)} className="rounded-lg p-2 hover:bg-brand-soft" aria-label="Keyingi oy"><ChevronRight size={18} /></button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted">
          {WEEK.map((w) => <span key={w}>{w}</span>)}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1 text-center">
          {cells.map((d, i) => {
            if (!d) return <span key={i} />;
            const isSel = key(d) === key(sel);
            const isToday = key(d) === key(now);
            return (
              <button key={i} onClick={() => setSel(d)}
                className={`relative aspect-square rounded-full text-sm font-semibold transition ${isSel ? "bg-brand text-on-brand" : isToday ? "bg-brand-soft text-brand" : "hover:bg-brand-soft"}`}>
                {d.getDate()}
                {byDay[key(d)] && <span className={`absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full ${isSel ? "bg-on-brand" : "bg-pen"}`} />}
              </button>
            );
          })}
        </div>
      </div>

      <p className="mb-2 mt-5 text-sm font-semibold">{sel.getDate()}-{MONTHS[sel.getMonth()].toLowerCase()} vazifalari</p>
      {list.length ? (
        <div className="space-y-2">
          {list.map((a) => (
            <Link key={a.id} to={`/assignment/${a.id}`} className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3 hover:border-brand">
              <SubjectIcon subject={a.subject} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{a.subject || "Vazifa"}</p>
                <p className="truncate text-xs text-muted">{a.title}</p>
              </div>
              <span className="text-xs text-muted">{formatTime(a.due_date)}</span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-line bg-surface p-4 text-center text-sm text-muted">Bu kunga vazifa yo'q.</div>
      )}
    </div>
  );
}
