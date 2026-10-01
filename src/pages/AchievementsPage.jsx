import { useEffect, useState } from "react";
import { Award, Check, Flame, Lock, Minus, Plus } from "lucide-react";
import { errorMessage, fetchMyStats } from "../api";
import { ErrorNote, ProgressBar, Spinner } from "../components/ui";

function useTarget(name, def) {
  const [v, setV] = useState(() => Number(localStorage.getItem(name)) || def);
  const set = (n) => {
    const x = Math.max(1, Math.min(99, n));
    setV(x);
    try { localStorage.setItem(name, String(x)); } catch { /* ignore */ }
  };
  return [v, set];
}

function Goal({ title, value, target, setTarget }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="flex items-center justify-between">
        <p className="font-semibold">{title}</p>
        <div className="flex items-center gap-2 text-sm">
          <button onClick={() => setTarget(target - 1)} className="rounded-md bg-brand-soft p-1 text-brand" aria-label="Kamaytirish"><Minus size={14} /></button>
          <span className="font-bold">{value} / {target}</span>
          <button onClick={() => setTarget(target + 1)} className="rounded-md bg-brand-soft p-1 text-brand" aria-label="Oshirish"><Plus size={14} /></button>
        </div>
      </div>
      <div className="mt-2"><ProgressBar value={value} max={target} tone={value >= target ? "ok" : "brand"} /></div>
    </div>
  );
}

export default function AchievementsPage() {
  const [s, setS] = useState(null);
  const [error, setError] = useState("");
  const [wt, setWt] = useTarget("goal_week", 5);
  const [mt, setMt] = useTarget("goal_month", 20);

  useEffect(() => {
    fetchMyStats().then(setS).catch((e) => setError(errorMessage(e)));
  }, []);

  if (error) return <div className="mx-auto max-w-3xl"><ErrorNote>{error}</ErrorNote></div>;
  if (!s) return <Spinner />;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-extrabold sm:text-4xl">Yutuqlar</h1>

      <div className="mt-5 flex items-center gap-4 rounded-2xl bg-warn-soft p-4">
        <Flame size={36} className="text-pen" />
        <div>
          <p className="font-display text-2xl font-extrabold">{s.streak} kunlik streak</p>
          <p className="text-sm text-muted">Ketma-ket kun vazifa topshiring, streak uzilmasin!</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3 text-center">
        {[[s.total_submitted, "Topshirilgan"], [s.graded, "Baholangan"], [s.average ?? "–", "O'rtacha"]].map(([v, l]) => (
          <div key={l} className="rounded-xl border border-line bg-surface p-3">
            <p className="font-display text-2xl font-extrabold">{v}</p>
            <p className="text-xs text-muted">{l}</p>
          </div>
        ))}
      </div>

      <p className="mb-2 mt-6 text-sm font-semibold">Mening maqsadlarim</p>
      <div className="space-y-2">
        <Goal title="Haftalik maqsad" value={s.week} target={wt} setTarget={setWt} />
        <Goal title="Oylik maqsad" value={s.month} target={mt} setTarget={setMt} />
      </div>

      <p className="mb-2 mt-6 text-sm font-semibold">Yutuqlar</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {s.achievements.map((a) => (
          <div key={a.key} className={`rounded-xl border p-4 ${a.done ? "border-ok bg-ok-soft" : "border-line bg-surface"}`}>
            <div className="flex items-center gap-3">
              <span className={`grid h-10 w-10 place-items-center rounded-full ${a.done ? "bg-ok text-white" : "bg-brand-soft text-muted"}`}>
                {a.done ? <Check size={18} /> : <Lock size={16} />}
              </span>
              <div className="min-w-0">
                <p className="flex items-center gap-1 font-semibold"><Award size={14} />{a.title}</p>
                <p className="text-xs text-muted">{a.hint}</p>
              </div>
            </div>
            {!a.done && <div className="mt-2"><ProgressBar value={a.value} max={a.target} /></div>}
          </div>
        ))}
      </div>
    </div>
  );
}
