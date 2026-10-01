import { useEffect, useState } from "react";
import { errorMessage, fetchMyClass } from "../api";
import { Avatar, EmptyState, ErrorNote, Spinner } from "../components/ui";
import { Users } from "lucide-react";

export default function ClassPage() {
  const [c, setC] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    fetchMyClass().then(setC).catch((e) => setError(errorMessage(e)));
  }, []);

  if (error) return <div className="mx-auto max-w-3xl"><ErrorNote>{error}</ErrorNote></div>;
  if (!c) return <Spinner />;
  if (!c.name) return <EmptyState icon={Users} title="Sinf tayinlanmagan" hint="Administrator sizni sinfga qo'shishi kerak." />;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-extrabold sm:text-4xl">{c.name} sinf</h1>
      <div className="mt-5 grid grid-cols-3 gap-3 text-center">
        {[[c.students_count, "O'quvchi"], [c.teachers_count, "O'qituvchi"], [c.assignments_count, "Vazifa"]].map(([v, l]) => (
          <div key={l} className="rounded-xl border border-line bg-surface p-3">
            <p className="font-display text-2xl font-extrabold">{v}</p>
            <p className="text-xs text-muted">{l}</p>
          </div>
        ))}
      </div>
      <p className="mb-2 mt-6 text-sm font-semibold">O'quvchilar</p>
      <div className="space-y-2">
        {c.students.map((s) => (
          <div key={s.id} className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3">
            <Avatar name={s.full_name} size={40} />
            <p className="flex-1 truncate font-semibold">{s.full_name}</p>
            <span className="text-xs text-muted">{s.done} ta topshirgan</span>
          </div>
        ))}
      </div>
    </div>
  );
}
