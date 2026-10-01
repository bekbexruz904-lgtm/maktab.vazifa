import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Award, Bell, FileEdit, Send } from "lucide-react";
import { errorMessage, fetchNotifications, markAllNotificationsRead, markNotificationRead } from "../api";
import { EmptyState, ErrorNote, Spinner } from "../components/ui";
import { useUnread } from "../context/NotificationContext";

const ICONS = { new_assignment: FileEdit, graded: Award, submitted: Send };
const TONE = {
  new_assignment: "bg-brand-soft text-brand",
  graded: "bg-ok-soft text-ok",
  submitted: "bg-warn-soft text-warn",
};

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "hozirgina";
  if (diff < 3600) return `${Math.floor(diff / 60)} daqiqa oldin`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} soat oldin`;
  return `${Math.floor(diff / 86400)} kun oldin`;
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { refresh } = useUnread();
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchNotifications()
      .then((data) => {
        setItems(data);
        if (data.some((n) => !n.is_read)) {
          markAllNotificationsRead().then(refresh).catch(() => {});
        }
      })
      .catch((e) => setError(errorMessage(e)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const open = async (n) => {
    if (!n.is_read) {
      try { await markNotificationRead(n.id); } catch { /* ignore */ }
    }
    if (n.assignment) navigate(`/assignment/${n.assignment}`);
  };

  if (error) return <div className="mx-auto max-w-3xl"><ErrorNote>{error}</ErrorNote></div>;
  if (!items) return <Spinner />;

  const shown = filter === "all" ? items : items.filter((n) => !n.is_read);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-extrabold sm:text-4xl">Xabarnomalar</h1>
      <div className="mt-4 flex gap-2">
        {[["all", "Barchasi"], ["unread", "O'qilmagan"]].map(([id, label]) => (
          <button key={id} onClick={() => setFilter(id)} aria-pressed={filter === id}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${filter === id ? "border-brand bg-brand text-on-brand" : "border-line bg-surface hover:bg-brand-soft"}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        {shown.length === 0 && <EmptyState icon={Bell} title="Xabarnoma yo'q" hint="Yangi vazifa yoki baho bo'lsa, shu yerda ko'rinadi." />}
        {shown.map((n) => {
          const Icon = ICONS[n.kind] || Bell;
          return (
            <button
              key={n.id}
              onClick={() => open(n)}
              className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition hover:border-brand ${
                n.is_read ? "border-line bg-surface" : "border-brand/40 bg-brand-soft/40"
              }`}
            >
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${TONE[n.kind] || "bg-brand-soft text-brand"}`}>
                <Icon size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="font-semibold">{n.title}</span>
                  {!n.is_read && <span className="h-2 w-2 shrink-0 rounded-full bg-brand" />}
                </span>
                {n.body && <span className="mt-0.5 block truncate text-sm text-muted">{n.body}</span>}
                <span className="mt-1 block text-xs text-muted">{timeAgo(n.created_at)}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
