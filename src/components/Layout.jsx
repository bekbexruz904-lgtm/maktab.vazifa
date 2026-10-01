import { useEffect, useState } from "react";
import { Bell, CalendarDays, ClipboardList, Home, School, Trophy, User, UserCog, Users } from "lucide-react";
import { NotebookPen } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useUnread } from "../context/NotificationContext";
import BottomNav from "./BottomNav";

export function useTheme() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    try { localStorage.setItem("theme", dark ? "dark" : "light"); } catch { /* ignore */ }
  }, [dark]);
  return [dark, setDark];
}

export function Logo({ className = "" }) {
  return (
    <span className={`inline-flex items-center gap-2 font-display text-xl font-extrabold ${className}`}>
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-on-brand"><NotebookPen size={18} /></span>
      Maktab Vazifa
    </span>
  );
}

const STUDENT_TABS = [
  { to: "/", label: "Bosh sahifa", icon: Home, end: true },
  { to: "/vazifalar", label: "Vazifalar", icon: ClipboardList },
  { to: "/kalendar", label: "Kalendar", icon: CalendarDays },
  { to: "/yutuqlar", label: "Yutuqlar", icon: Trophy },
  { to: "/profil", label: "Profil", icon: User },
];
const TEACHER_TABS = [
  { to: "/", label: "Bosh sahifa", icon: Home, end: true },
  { to: "/vazifalar", label: "Vazifalar", icon: ClipboardList },
  { to: "/kalendar", label: "Kalendar", icon: CalendarDays },
  { to: "/xabarnomalar", label: "Xabarnomalar", icon: Bell, badgeKey: true },
  { to: "/profil", label: "Profil", icon: User },
];
const ADMIN_TABS = [
  { to: "/", label: "Umumiy", icon: Home, end: true },
  { to: "/sinflar", label: "Sinflar", icon: School },
  { to: "/oqituvchilar", label: "O'qituvchi", icon: UserCog },
  { to: "/oquvchilar", label: "O'quvchi", icon: Users },
  { to: "/profil", label: "Profil", icon: User },
];

export default function Layout({ children }) {
  const { user } = useAuth();
  const { count } = useUnread();
  const tabs = user.role === "admin" ? ADMIN_TABS : user.role === "teacher" ? TEACHER_TABS : STUDENT_TABS;
  const withBadge = tabs.map((t) => ({ ...t, badge: t.badgeKey ? count : 0 }));

  return (
    <div className="min-h-screen pb-20">
      <main className="mx-auto max-w-3xl px-4 py-6 sm:py-8">{children}</main>
      <BottomNav items={withBadge} />
    </div>
  );
}
