import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { GraduationCap, Pencil, Plus, Search, Trash2, UserCog, Users, School } from "lucide-react";
import {
  adminClasses, adminDeleteClass, adminDeleteUser, adminSaveClass,
  adminSaveUser, adminStats, adminUsers, errorMessage,
} from "../api";
import {
  Avatar, Badge, Button, ConfirmDialog, EmptyState, ErrorNote, Field, Modal, Spinner,
} from "../components/ui";
import { useToast } from "../components/Toast";

/* ------------------------------------------------------------------ */
/* Umumiy ko'rinish                                                    */
/* ------------------------------------------------------------------ */
function AdminHero({ stats }) {
  const { user } = useAuth();
  return (
    <div className="-mx-4 -mt-6 mb-5 rounded-b-3xl bg-brand px-4 pb-6 pt-8 text-on-brand sm:mx-0 sm:mt-0 sm:rounded-2xl sm:p-6">
      <p className="text-sm text-on-brand/75">Assalomu alaykum,</p>
      <div className="mt-0.5 flex items-center gap-2">
        <h1 className="font-display text-2xl font-extrabold sm:text-3xl">{user.full_name}</h1>
        <span className="rounded-md bg-white/20 px-2 py-0.5 text-xs font-bold">Maktab paneli</span>
      </div>
      <div className="mt-5 rounded-2xl bg-white p-4 text-ink shadow-lg">
        <p className="mb-3 text-sm font-semibold">Umumiy ma'lumot</p>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div><p className="font-display text-xl font-extrabold">{stats.students}</p><p className="text-xs text-muted">O'quvchilar</p></div>
          <div><p className="font-display text-xl font-extrabold">{stats.teachers}</p><p className="text-xs text-muted">O'qituvchilar</p></div>
          <div><p className="font-display text-xl font-extrabold">{stats.classes}</p><p className="text-xs text-muted">Sinflar</p></div>
        </div>
      </div>
    </div>
  );
}

export function AdminOverview({ goTo }) {
  const [s, setS] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    adminStats().then(setS).catch((e) => setError(errorMessage(e)));
  }, []);

  if (error) return <ErrorNote>{error}</ErrorNote>;
  if (!s) return <Spinner />;

  const tiles = [
    ["O'quvchilar", s.students, "students"],
    ["O'qituvchilar", s.teachers, "teachers"],
    ["Sinflar", s.classes, "classes"],
    ["Berilgan vazifalar", s.assignments],
    ["Topshirilgan ishlar", s.submissions],
    ["Tekshirilmagan ishlar", s.ungraded],
  ];

  return (
    <div>
      <AdminHero stats={s} />
      {s.pending_teachers > 0 && (
        <button
          onClick={() => goTo("teachers")}
          className="mb-4 flex w-full items-center justify-between gap-3 rounded-xl border border-warn/40 bg-warn-soft px-4 py-3 text-left text-sm font-semibold text-warn"
        >
          <span>{s.pending_teachers} ta o'qituvchi tasdiqlashingizni kutmoqda</span>
          <span>Ko'rish →</span>
        </button>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {tiles.map(([label, value, tab]) => (
          <button
            key={label}
            onClick={() => tab && goTo(tab)}
            disabled={!tab}
            className="rounded-xl border border-line bg-surface p-4 text-left transition enabled:hover:border-brand"
          >
            <p className="font-display text-3xl font-extrabold">{value}</p>
            <p className="mt-1 text-sm text-muted">{label}</p>
          </button>
        ))}
      </div>
      <div className="mt-6 rounded-xl border border-line bg-surface p-4 text-sm">
        <p className="font-semibold">Boshlash tartibi</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-muted">
          <li>"Sinflar" bo'limida maktabdagi sinflarni qo'shing.</li>
          <li>"O'qituvchilar" bo'limida ustozlarga login va parol yarating.</li>
          <li>O'quvchilar o'zlari ro'yxatdan o'tadi yoki siz "O'quvchilar" bo'limida qo'shasiz.</li>
        </ol>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sinflar                                                             */
/* ------------------------------------------------------------------ */
export function AdminClasses() {
  const toast = useToast();
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [adding, setAdding] = useState(false);
  const [edit, setEdit] = useState(null); // { id, name }
  const [del, setDel] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    adminClasses().then(setItems).catch((e) => setError(errorMessage(e)));
  }, []);
  useEffect(load, [load]);

  const add = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setAdding(true);
    try {
      await adminSaveClass(null, { name });
      setName("");
      toast("Sinf qo'shildi");
      load();
    } catch (err) {
      toast(errorMessage(err), "error");
    } finally {
      setAdding(false);
    }
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await adminSaveClass(edit.id, { name: edit.name });
      toast("Sinf nomi o'zgartirildi");
      setEdit(null);
      load();
    } catch (err) {
      toast(errorMessage(err), "error");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await adminDeleteClass(del.id);
      toast("Sinf o'chirildi");
      setDel(null);
      load();
    } catch (err) {
      toast(errorMessage(err), "error");
      setDel(null);
    } finally {
      setBusy(false);
    }
  };

  if (error) return <ErrorNote>{error}</ErrorNote>;
  if (!items) return <Spinner />;

  return (
    <div>
      <form onSubmit={add} className="flex gap-2">
        <input className="input" placeholder="Yangi sinf nomi, masalan: 10-A" value={name} onChange={(e) => setName(e.target.value)} maxLength={50} />
        <Button type="submit" loading={adding} className="shrink-0"><Plus size={18} /> Qo'shish</Button>
      </form>

      <div className="mt-4 space-y-2">
        {items.length === 0 && <EmptyState icon={School} title="Hali sinf yo'q" hint="Yuqoridagi maydonga sinf nomini yozib, qo'shing." />}
        {items.map((c) => (
          <div key={c.id} className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3">
            <span className="grid h-10 w-14 shrink-0 place-items-center rounded-lg bg-brand-soft font-display text-lg font-extrabold text-brand">{c.name}</span>
            <p className="min-w-0 flex-1 text-sm text-muted">
              {c.student_count} ta o'quvchi · {c.assignment_count} ta vazifa
            </p>
            <Button variant="ghost" size="sm" onClick={() => setEdit({ id: c.id, name: c.name })} aria-label="Tahrirlash"><Pencil size={16} /></Button>
            <Button variant="ghost" size="sm" onClick={() => setDel(c)} aria-label="O'chirish"><Trash2 size={16} /></Button>
          </div>
        ))}
      </div>

      {edit && (
        <Modal title="Sinf nomini o'zgartirish" onClose={() => setEdit(null)}>
          <form onSubmit={saveEdit} className="space-y-4">
            <Field label="Sinf nomi">
              <input className="input" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} required maxLength={50} autoFocus />
            </Field>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setEdit(null)}>Bekor qilish</Button>
              <Button type="submit" loading={busy}>Saqlash</Button>
            </div>
          </form>
        </Modal>
      )}
      {del && (
        <ConfirmDialog
          title="Sinfni o'chirish"
          text={`"${del.name}" sinfini o'chirmoqchimisiz? Sinfda o'quvchi yoki vazifa bo'lsa, o'chirib bo'lmaydi.`}
          confirmLabel="Ha, o'chirish"
          loading={busy}
          onConfirm={remove}
          onClose={() => setDel(null)}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* O'qituvchilar va o'quvchilar (bitta komponent, role bilan)          */
/* ------------------------------------------------------------------ */
function UserFormModal({ role, user, classes, onClose, onSaved }) {
  const isEdit = !!user;
  const [f, setF] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    username: user?.username || "",
    password: "",
    school_class: user?.school_class || "",
    is_active: user ? user.is_active : true,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const student = role === "student";

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const body = {
      first_name: f.first_name.trim(),
      last_name: f.last_name.trim(),
      username: f.username.trim(),
      is_active: f.is_active,
      role,
    };
    if (student) body.school_class = f.school_class || null;
    if (f.password) body.password = f.password;
    try {
      await adminSaveUser(user?.id, body);
      onSaved(isEdit ? "O'zgarishlar saqlandi" : student ? "O'quvchi qo'shildi" : "O'qituvchi qo'shildi");
    } catch (err) {
      setError(errorMessage(err));
      setLoading(false);
    }
  };

  return (
    <Modal title={isEdit ? "Ma'lumotlarni tahrirlash" : student ? "Yangi o'quvchi" : "Yangi o'qituvchi"} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <ErrorNote>{error}</ErrorNote>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Ism"><input className="input" value={f.first_name} onChange={set("first_name")} required /></Field>
          <Field label="Familiya"><input className="input" value={f.last_name} onChange={set("last_name")} required /></Field>
        </div>
        <Field label="Login">
          <input className="input" value={f.username} onChange={set("username")} required autoCapitalize="none" autoComplete="off" />
        </Field>
        <Field label={isEdit ? "Yangi parol" : "Parol"} hint={isEdit ? "O'zgartirmoqchi bo'lmasangiz, bo'sh qoldiring" : "Kamida 6 ta belgi"}>
          <input className="input" type="text" value={f.password} onChange={set("password")} required={!isEdit} autoComplete="new-password" />
        </Field>
        {student && (
          <Field label="Sinf">
            <select className="input" value={f.school_class} onChange={set("school_class")} required>
              <option value="">Sinfni tanlang</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
        )}
        {isEdit && (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={f.is_active} onChange={(e) => setF({ ...f, is_active: e.target.checked })} className="h-4 w-4" />
            Akkaunt faol (o'chirilsa, tizimga kira olmaydi)
          </label>
        )}
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>Bekor qilish</Button>
          <Button type="submit" loading={loading}>{isEdit ? "Saqlash" : "Qo'shish"}</Button>
        </div>
      </form>
    </Modal>
  );
}

export function AdminUsers({ role }) {
  const toast = useToast();
  const student = role === "student";
  const [users, setUsers] = useState(null);
  const [classes, setClasses] = useState([]);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [cls, setCls] = useState("");
  const [modal, setModal] = useState(null); // "new" | user
  const [del, setDel] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    adminClasses().then(setClasses).catch(() => {});
  }, []);

  const load = useCallback(() => {
    const params = { role };
    if (search.trim()) params.search = search.trim();
    if (student && cls) params.school_class = cls;
    adminUsers(params).then(setUsers).catch((e) => setError(errorMessage(e)));
  }, [role, search, cls, student]);

  // qidiruv yozilganda serverga har harfda emas, biroz kutib so'rov yuboramiz
  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const remove = async () => {
    setBusy(true);
    try {
      await adminDeleteUser(del.id);
      toast("O'chirildi");
      setDel(null);
      load();
    } catch (err) {
      toast(errorMessage(err), "error");
      setDel(null);
    } finally {
      setBusy(false);
    }
  };

  const approve = async (u) => {
    try {
      await adminSaveUser(u.id, { is_approved: true });
      toast(`${u.full_name} tasdiqlandi`);
      load();
    } catch (err) {
      toast(errorMessage(err), "error");
    }
  };

  const noun = student ? "o'quvchi" : "o'qituvchi";

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input className="input pl-9" placeholder="Ism yoki login bo'yicha qidirish" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {student && (
          <select className="input w-auto" value={cls} onChange={(e) => setCls(e.target.value)} aria-label="Sinf bo'yicha filtr">
            <option value="">Hamma sinflar</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}
        <Button onClick={() => setModal("new")}><Plus size={18} /> Yangi {noun}</Button>
      </div>

      {error && <div className="mt-3"><ErrorNote>{error}</ErrorNote></div>}
      {!users && !error && <Spinner />}

      <div className="mt-4 space-y-2">
        {users && users.length === 0 && (
          <EmptyState
            icon={student ? GraduationCap : UserCog}
            title={search || cls ? "Hech narsa topilmadi" : `Hali ${noun} yo'q`}
            hint={search || cls ? "Qidiruv yoki filtrni o'zgartirib ko'ring." : `"Yangi ${noun}" tugmasi bilan qo'shing.`}
          />
        )}
        {users && users.map((u) => (
          <div key={u.id} className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3">
            <Avatar name={u.full_name} size={40} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{u.full_name}</p>
              <p className="truncate text-xs text-muted">@{u.username}</p>
            </div>
            {student && u.school_class_name && <Badge>{u.school_class_name}</Badge>}
            {!u.is_active && <Badge tone="pen">Faol emas</Badge>}
            {!u.is_approved && (
              <>
                <Badge tone="warn">Tasdiqlanmagan</Badge>
                <Button size="sm" onClick={() => approve(u)}>Tasdiqlash</Button>
              </>
            )}
            <Button variant="ghost" size="sm" onClick={() => setModal(u)} aria-label="Tahrirlash"><Pencil size={16} /></Button>
            <Button variant="ghost" size="sm" onClick={() => setDel(u)} aria-label="O'chirish"><Trash2 size={16} /></Button>
          </div>
        ))}
      </div>

      {modal && (
        <UserFormModal
          role={role}
          user={modal === "new" ? null : modal}
          classes={classes}
          onClose={() => setModal(null)}
          onSaved={(msg) => { setModal(null); toast(msg); load(); }}
        />
      )}
      {del && (
        <ConfirmDialog
          title={`${student ? "O'quvchi" : "O'qituvchi"}ni o'chirish`}
          text={`${del.full_name} o'chiriladi${student ? " va uning topshirgan ishlari ham yo'qoladi" : ""}. Qaytarib bo'lmaydi. Vaqtincha to'xtatmoqchi bo'lsangiz, tahrirlashda akkauntni faolsizlantiring.`}
          confirmLabel="Ha, o'chirish"
          loading={busy}
          onConfirm={remove}
          onClose={() => setDel(null)}
        />
      )}
    </div>
  );
}

