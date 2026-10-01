import { useEffect, useMemo, useState } from "react";
import { Award, Bell, BookOpenCheck, ClipboardList, KeyRound, LogOut, Moon, School, Sun, Trophy, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../components/Layout";
import { Avatar, Button, ErrorNote, Field, Modal, Spinner } from "../components/ui";
import { useToast } from "../components/Toast";
import { changeMyPassword, errorMessage, fetchAssignments } from "../api";

function ROLE_LABEL(u) {
  if (u.role === "admin") return "Administrator";
  if (u.role === "teacher") return "O'qituvchi";
  return u.school_class_name ? `${u.school_class_name} sinf o'quvchisi` : "O'quvchi";
}

function ChangePasswordModal({ onClose }) {
  const toast = useToast();
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await changeMyPassword(oldPw, newPw);
      toast("Parol almashtirildi");
      onClose();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Parolni almashtirish" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <ErrorNote>{error}</ErrorNote>
        <Field label="Joriy parol">
          <input className="input" type="password" value={oldPw} onChange={(e) => setOldPw(e.target.value)} required autoComplete="current-password" />
        </Field>
        <Field label="Yangi parol" hint="Kamida 6 ta belgi">
          <input className="input" type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} required autoComplete="new-password" />
        </Field>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>Bekor qilish</Button>
          <Button type="submit" loading={loading}>Saqlash</Button>
        </div>
      </form>
    </Modal>
  );
}

function StatCard({ icon: Icon, value, label, tone = "brand" }) {
  const toneCls = { brand: "text-brand", ok: "text-ok", pen: "text-pen", warn: "text-warn" }[tone];
  return (
    <div className="rounded-xl border border-line bg-surface p-4 text-center">
      <Icon size={20} className={`mx-auto ${toneCls}`} />
      <p className="mt-2 font-display text-2xl font-extrabold">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}

function StudentStats({ items }) {
  const stats = useMemo(() => {
    const total = items.length;
    const graded = items.filter((a) => a.status === "graded");
    const waiting = items.filter((a) => a.status === "pending" || a.status === "overdue").length;
    const grades = graded.map((a) => a.my_submission.grade);
    const avg = grades.length ? (grades.reduce((s, v) => s + v, 0) / grades.length).toFixed(1) : "–";
    return { total, gradedCount: graded.length, waiting, avg };
  }, [items]);

  return (
    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard icon={ClipboardList} value={stats.total} label="Jami vazifa" />
      <StatCard icon={BookOpenCheck} value={stats.gradedCount} label="Baholangan" tone="ok" />
      <StatCard icon={Users} value={stats.waiting} label="Kutilmoqda" tone="warn" />
      <StatCard icon={Award} value={stats.avg} label="O'rtacha baho" />
    </div>
  );
}

function TeacherStats({ items }) {
  const stats = useMemo(() => {
    const given = items.length;
    const submitted = items.reduce((s, a) => s + a.submitted_count, 0);
    const graded = items.reduce((s, a) => s + a.graded_count, 0);
    return { given, submitted, unchecked: submitted - graded };
  }, [items]);

  return (
    <div className="mt-5 grid grid-cols-3 gap-3">
      <StatCard icon={ClipboardList} value={stats.given} label="Berilgan vazifa" />
      <StatCard icon={BookOpenCheck} value={stats.submitted} label="Topshirilgan" tone="ok" />
      <StatCard icon={Users} value={stats.unchecked} label="Tekshirilmagan" tone="pen" />
    </div>
  );
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [dark, setDark] = useTheme();
  const [pwModal, setPwModal] = useState(false);
  const [items, setItems] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user.role === "teacher" || user.role === "student") {
      fetchAssignments().then(setItems).catch(() => setItems([]));
    }
  }, [user.role]);

  const Row = ({ icon: Icon, label, onClick, danger }) => (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl border border-line bg-surface p-4 text-left transition hover:bg-brand-soft ${danger ? "text-pen hover:bg-pen-soft" : ""}`}
    >
      <Icon size={20} className="shrink-0" />
      <span className="font-semibold">{label}</span>
    </button>
  );

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-extrabold sm:text-4xl">Profil</h1>

      <div className="mt-5 flex flex-col items-center rounded-2xl border border-line bg-surface p-6 text-center">
        <Avatar name={user.full_name} size={72} />
        <p className="mt-3 truncate text-xl font-bold">{user.full_name}</p>
        <p className="text-sm text-muted">@{user.username}</p>
        <p className="mt-1 rounded-full bg-brand-soft px-3 py-1 text-sm font-semibold text-brand">{ROLE_LABEL(user)}</p>
      </div>

      {user.role === "student" && (items ? <StudentStats items={items} /> : <div className="mt-5"><Spinner /></div>)}
      {user.role === "teacher" && (items ? <TeacherStats items={items} /> : <div className="mt-5"><Spinner /></div>)}

      <div className="mt-5 space-y-2">
        {user.role === "student" && <Row icon={School} label="Mening sinfim" onClick={() => navigate("/sinf")} />}
        {user.role === "student" && <Row icon={Trophy} label="Yutuqlar va maqsadlar" onClick={() => navigate("/yutuqlar")} />}
        {user.role !== "admin" && <Row icon={Bell} label="Xabarnomalar" onClick={() => navigate("/xabarnomalar")} />}
        <Row icon={KeyRound} label="Parolni almashtirish" onClick={() => setPwModal(true)} />
        <Row icon={dark ? Sun : Moon} label={dark ? "Yorug' rejimga o'tish" : "Qorong'i rejimga o'tish"} onClick={() => setDark(!dark)} />
        <Row icon={LogOut} label="Tizimdan chiqish" onClick={logout} danger />
      </div>

      {pwModal && <ChangePasswordModal onClose={() => setPwModal(false)} />}
    </div>
  );
}
