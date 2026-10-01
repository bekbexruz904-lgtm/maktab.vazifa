import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Trash2, Users } from "lucide-react";
import { deleteAssignment, errorMessage, fetchAssignment, fetchSubmissions, gradeSubmission } from "../api";
import { Avatar, Badge, Button, ConfirmDialog, EmptyState, ErrorNote, Modal, ProgressBar, Spinner } from "../components/ui";
import GradeMark, { gradeButtonClass } from "../components/GradeMark";
import Lightbox from "../components/Lightbox";
import { useToast } from "../components/Toast";
import { formatDateTime } from "../utils";

function ReviewModal({ sub, onClose, onSaved }) {
  const toast = useToast();
  const [grade, setGrade] = useState(sub.grade);
  const [feedback, setFeedback] = useState(sub.feedback || "");
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState(null);
  const urls = sub.images.map((i) => i.image);

  const save = async () => {
    setSaving(true);
    try {
      onSaved(await gradeSubmission(sub.id, grade, feedback));
      toast("Baho saqlandi");
    } catch (e) {
      toast(errorMessage(e), "error");
      setSaving(false);
    }
  };

  return (
    <Modal title={sub.student.full_name} onClose={onClose} wide>
      <p className="text-sm text-muted">Topshirilgan: {formatDateTime(sub.updated_at)}</p>
      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
        {urls.map((u, i) => (
          <button key={u} onClick={() => setView(i)} className="aspect-[3/4] overflow-hidden rounded-lg border border-line" aria-label={`${i + 1}-rasmni ochish`}>
            <img src={u} alt={`Sahifa ${i + 1}`} className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
      {sub.note && <p className="mt-3 rounded-lg bg-brand-soft px-3 py-2 text-sm">O'quvchi izohi: {sub.note}</p>}

      <div className="mt-5 border-t border-line pt-4">
        <p className="mb-2 text-sm font-medium">Baho</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((g) => (
            <button key={g} onClick={() => setGrade(g)} aria-pressed={grade === g}
              className={`grid h-12 w-12 place-items-center rounded-xl border-2 font-display text-xl font-extrabold transition ${gradeButtonClass(g, grade === g)}`}>
              {g}
            </button>
          ))}
        </div>
        <textarea className="input mt-3" rows={3} placeholder="O'quvchiga izoh (ixtiyoriy)" value={feedback} onChange={(e) => setFeedback(e.target.value)} />
        <div className="mt-3 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Yopish</Button>
          <Button onClick={save} loading={saving} disabled={!grade}>{sub.grade ? "Bahoni yangilash" : "Bahoni saqlash"}</Button>
        </div>
      </div>
      {view !== null && <Lightbox images={urls} start={view} onClose={() => setView(null)} />}
    </Modal>
  );
}

export default function TeacherAssignment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [a, setA] = useState(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("done");
  const [review, setReview] = useState(null);
  const [confirm, setConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [poster, setPoster] = useState(null);

  useEffect(() => {
    Promise.all([fetchAssignment(id), fetchSubmissions(id)])
      .then(([asg, subs]) => { setA(asg); setData(subs); })
      .catch((e) => setError(errorMessage(e, "Vazifa topilmadi.")));
  }, [id]);

  if (error) return <div className="mx-auto max-w-3xl"><ErrorNote>{error}</ErrorNote></div>;
  if (!a || !data) return <Spinner />;

  const total = data.submissions.length + data.missing.length;
  const unchecked = data.submissions.filter((s) => s.grade === null).length;

  const remove = async () => {
    setDeleting(true);
    try {
      await deleteAssignment(id);
      toast("Vazifa o'chirildi");
      navigate("/");
    } catch (e) {
      toast(errorMessage(e), "error");
      setDeleting(false);
    }
  };

  const onSaved = (updated) => {
    setData((d) => ({ ...d, submissions: d.submissions.map((s) => (s.id === updated.id ? updated : s)) }));
    setReview(null);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-ink"><ArrowLeft size={16} /> Vazifalar</Link>
        <Button variant="danger" size="sm" onClick={() => setConfirm(true)}><Trash2 size={14} /> O'chirish</Button>
      </div>

      <article className="sheet">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-medium text-muted">{a.subject || "Vazifa"}</p>
          <Badge>{a.school_class_name}</Badge>
        </div>
        <h1 className="mt-1 text-2xl font-extrabold leading-tight sm:text-3xl">{a.title}</h1>
        <p className="mt-3 whitespace-pre-wrap leading-relaxed">{a.description}</p>
        {a.attachment && (
          <button onClick={() => setPoster(a.attachment)} className="mt-3 block overflow-hidden rounded-lg border border-line" aria-label="Rasmni kattalashtirish">
            <img src={a.attachment} alt="Vazifa rasmi" className="max-h-48 object-contain" />
          </button>
        )}
        <div className="mt-4">
          <ProgressBar value={data.submissions.length} max={total} />
          <p className="mt-1.5 text-sm text-muted">{data.submissions.length} / {total} o'quvchi topshirdi{unchecked > 0 && <> · <b className="text-pen">{unchecked} ta tekshirilmagan</b></>}</p>
        </div>
      </article>

      <div className="mt-6 flex gap-2">
        {[["done", `Topshirganlar (${data.submissions.length})`], ["missing", `Topshirmaganlar (${data.missing.length})`]].map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} aria-pressed={tab === k}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${tab === k ? "border-brand bg-brand text-on-brand" : "border-line bg-surface hover:bg-brand-soft"}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="mt-3 space-y-2">
        {tab === "done" && data.submissions.length === 0 && <EmptyState icon={Users} title="Hali hech kim topshirmadi" hint="O'quvchilar rasm yuborganda shu yerda paydo bo'ladi." />}
        {tab === "done" && data.submissions.map((s) => (
          <button key={s.id} onClick={() => setReview(s)} className="flex w-full items-center gap-3 rounded-xl border border-line bg-surface p-3 text-left transition hover:border-brand">
            <Avatar name={s.student.full_name} size={40} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{s.student.full_name}</p>
              <p className="text-xs text-muted">{formatDateTime(s.updated_at)} · {s.images.length} ta rasm</p>
            </div>
            <div className="hidden -space-x-2 sm:flex">
              {s.images.slice(0, 3).map((im) => <img key={im.id} src={im.image} alt="" className="h-10 w-10 rounded-md border-2 border-surface object-cover" />)}
            </div>
            {s.grade ? <GradeMark value={s.grade} size={40} /> : <Badge tone="pen">Tekshirish</Badge>}
          </button>
        ))}
        {tab === "missing" && data.missing.length === 0 && <EmptyState title="Hamma topshirdi" hint="Barakalla, sinfda topshirmagan o'quvchi qolmadi." />}
        {tab === "missing" && data.missing.map((m) => (
          <div key={m.id} className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3">
            <Avatar name={m.full_name} size={40} />
            <p className="font-semibold">{m.full_name}</p>
          </div>
        ))}
      </div>

      {review && <ReviewModal sub={review} onClose={() => setReview(null)} onSaved={onSaved} />}
      {poster && <Lightbox images={[poster]} onClose={() => setPoster(null)} />}
      {confirm && (
        <ConfirmDialog title="Vazifani o'chirish" text="Vazifa va o'quvchilarning topshirgan barcha ishlari o'chib ketadi. Bu amalni qaytarib bo'lmaydi."
          confirmLabel="Ha, o'chirish" loading={deleting} onConfirm={remove} onClose={() => setConfirm(false)} />
      )}
    </div>
  );
}
