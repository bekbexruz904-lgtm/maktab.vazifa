import { useEffect, useState } from "react";
import { fetchClasses, login, register, errorMessage } from "../api";
import { useAuth } from "../context/AuthContext";
import { Button, ErrorNote, Field } from "../components/ui";
import { useTheme } from "../components/Layout";
import GradeMark from "../components/GradeMark";
import { CheckCircle2, Moon, NotebookPen, Sun } from "lucide-react";

export default function AuthPage() {
  const { signIn } = useAuth();
  const [mode, setMode] = useState("login");
  const [classes, setClasses] = useState([]);
  const [form, setForm] = useState({
    username: "", password: "", first_name: "", last_name: "", school_class: "", role: "student",
  });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [dark, setDark] = useTheme();

  useEffect(() => {
    fetchClasses().then(setClasses).catch(() => {});
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const isTeacher = form.role === "teacher";

  const doLogin = async (username, password) => {
    setError(""); setNotice(""); setLoading(true);
    try {
      const data = await login(username, password);
      signIn(data.token, data.user);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);
    try {
      if (mode === "login") {
        const data = await login(form.username.trim(), form.password);
        signIn(data.token, data.user);
      } else {
        const body = { ...form, username: form.username.trim() };
        if (isTeacher) delete body.school_class;
        const data = await register(body);
        if (data.pending) {
          setNotice(data.detail);
          setMode("login");
          setForm({ ...form, password: "" });
        } else {
          signIn(data.token, data.user);
        }
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const tab = (id, label) => (
    <button
      type="button"
      onClick={() => { setMode(id); setError(""); setNotice(""); }}
      className={`flex-1 rounded-full py-2 text-sm font-semibold transition ${mode === id ? "bg-surface text-ink shadow-sm" : "text-muted"}`}
      aria-pressed={mode === id}
    >
      {label}
    </button>
  );

  const roleBtn = (id, label) => (
    <button
      type="button"
      onClick={() => setForm({ ...form, role: id })}
      aria-pressed={form.role === id}
      className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
        form.role === id ? "border-brand bg-brand-soft text-brand" : "border-line bg-surface text-muted hover:bg-brand-soft"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex min-h-screen justify-center px-4 py-6 sm:items-center sm:py-10">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-2 font-display text-xl font-extrabold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-on-brand"><NotebookPen size={18} /></span>
            Maktab Vazifa
          </span>
          <button onClick={() => setDark(!dark)} className="grid h-10 w-10 place-items-center rounded-lg text-muted hover:bg-brand-soft" aria-label={dark ? "Yorug' rejim" : "Qorong'i rejim"}>
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        {/* Ko'k banner karta */}
        <div className="relative mt-5 overflow-hidden rounded-2xl bg-brand px-5 pb-16 pt-6 text-on-brand">
          <h1 className="font-display text-2xl font-extrabold leading-tight">
            Daftarni rasmga oling.<br />Ustoz tekshiradi.
          </h1>
          <p className="mt-2 text-sm text-on-brand/75">
            Uy vazifasi bir joyda: ustoz yozadi, o'quvchi rasm yuboradi, baho darrov qaytadi.
          </p>
        </div>
        <div className="relative -mt-10 mx-3 flex items-center justify-between rounded-xl bg-surface p-3 pl-4 shadow-lg">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">5-mashq, 3 va 4-masalalar</p>
            <p className="text-xs text-muted">Ustoz bahosi: 5</p>
          </div>
          <GradeMark value={5} size={40} />
        </div>

        <div className="mt-6 rounded-2xl border border-line bg-surface p-5">
          <h2 className="text-2xl font-extrabold">{mode === "login" ? "Tizimga kirish" : "Ro'yxatdan o'tish"}</h2>
          <div className="mt-4 flex rounded-full bg-brand-soft p-1">{tab("login", "Kirish")}{tab("register", "Ro'yxatdan o'tish")}</div>

          <form onSubmit={submit} className="mt-4 space-y-4">
            {notice && (
              <p className="flex items-start gap-2 rounded-lg bg-ok-soft px-3 py-2 text-sm font-medium text-ok" role="status">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0" /> {notice}
              </p>
            )}
            <ErrorNote>{error}</ErrorNote>

            {mode === "register" && (
              <>
                <div className="flex gap-2">{roleBtn("student", "O'quvchiman")}{roleBtn("teacher", "O'qituvchiman")}</div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Ism"><input className="input" value={form.first_name} onChange={set("first_name")} required autoComplete="given-name" /></Field>
                  <Field label="Familiya"><input className="input" value={form.last_name} onChange={set("last_name")} required autoComplete="family-name" /></Field>
                </div>
              </>
            )}
            <Field label="Login">
              <input className="input" value={form.username} onChange={set("username")} required autoComplete="username" autoCapitalize="none" />
            </Field>
            <Field label="Parol" hint={mode === "register" ? "Kamida 6 ta belgi" : undefined}>
              <input className="input" type="password" value={form.password} onChange={set("password")} required autoComplete={mode === "login" ? "current-password" : "new-password"} />
            </Field>
            {mode === "register" && !isTeacher && (
              <Field
                label="Sinfingiz"
                hint={classes.length === 0 ? "Hozircha sinflar qo'shilmagan. Administrator avval sinflarni qo'shishi kerak." : undefined}
              >
                <select className="input" value={form.school_class} onChange={set("school_class")} required>
                  <option value="">Sinfni tanlang</option>
                  {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
            )}
            {mode === "register" && isTeacher && (
              <p className="rounded-lg bg-warn-soft px-3 py-2 text-sm text-warn">
                O'qituvchi akkaunti administrator tasdiqlagandan keyin ishga tushadi.
              </p>
            )}
            <Button type="submit" loading={loading} className="w-full">
              {mode === "login" ? "Kirish" : isTeacher ? "Ariza yuborish" : "Ro'yxatdan o'tish"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
