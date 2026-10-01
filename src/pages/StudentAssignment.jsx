import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Send } from "lucide-react";
import { errorMessage, fetchAssignment, submitHomework } from "../api";
import { Badge, Button, ErrorNote, ProgressBar, Spinner } from "../components/ui";
import ImagePicker from "../components/ImagePicker";
import Lightbox from "../components/Lightbox";
import GradeMark from "../components/GradeMark";
import { useToast } from "../components/Toast";
import { formatDateTime } from "../utils";

function Thumbs({ urls, onOpen }) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {urls.map((u, i) => (
        <button key={u} onClick={() => onOpen(i)} className="aspect-[3/4] overflow-hidden rounded-lg border border-line" aria-label={`${i + 1}-rasmni kattalashtirish`}>
          <img src={u} alt={`Sahifa ${i + 1}`} className="h-full w-full object-cover" />
        </button>
      ))}
    </div>
  );
}

export default function StudentAssignment() {
  const { id } = useParams();
  const toast = useToast();
  const [a, setA] = useState(null);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [box, setBox] = useState(null); // { images, start }

  useEffect(() => {
    fetchAssignment(id).then(setA).catch((e) => setError(errorMessage(e, "Vazifa topilmadi.")));
  }, [id]);

  if (error) return <div className="mx-auto max-w-3xl"><ErrorNote>{error}</ErrorNote></div>;
  if (!a) return <Spinner />;

  const sub = a.my_submission;
  const graded = sub && sub.grade !== null;
  const subUrls = sub ? sub.images.map((i) => i.image) : [];

  const send = async () => {
    setSending(true);
    setProgress(0);
    const fd = new FormData();
    items.forEach((it) => fd.append("images", it.file));
    fd.append("note", note);
    try {
      await submitHomework(id, fd, setProgress);
      toast(sub ? "Vazifa qayta topshirildi" : "Vazifa topshirildi");
      setItems([]);
      setNote("");
      setA(await fetchAssignment(id));
    } catch (e) {
      toast(errorMessage(e), "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-ink">
        <ArrowLeft size={16} /> Vazifalar
      </Link>

      <article className="sheet">
        <p className="text-xs font-medium text-muted">{a.subject || "Vazifa"} · {a.teacher_name}</p>
        <h1 className="mt-1 text-2xl font-extrabold leading-tight sm:text-3xl">{a.title}</h1>
        <p className="mt-4 whitespace-pre-wrap leading-relaxed">{a.description}</p>
        {a.attachment && (
          <button onClick={() => setBox({ images: [a.attachment], start: 0 })} className="mt-4 block overflow-hidden rounded-lg border border-line" aria-label="Vazifa rasmini kattalashtirish">
            <img src={a.attachment} alt="Vazifa rasmi" className="max-h-64 object-contain" />
          </button>
        )}
      </article>

      <section className="mt-6">
        <h2 className="text-xl font-bold">Mening ishim</h2>

        {graded && (
          <div className="mt-3 flex items-start gap-4 rounded-xl border border-line bg-surface p-4">
            <GradeMark value={sub.grade} size={64} />
            <div className="min-w-0">
              <p className="font-semibold">Ustoz baholadi</p>
              {sub.feedback ? <p className="mt-1 whitespace-pre-wrap text-sm">{sub.feedback}</p> : <p className="mt-1 text-sm text-muted">Izoh qoldirilmagan.</p>}
            </div>
          </div>
        )}

        {sub && (
          <div className="mt-3">
            <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-muted">
              {!graded && <Badge tone="warn"><CheckCircle2 size={12} /> Tekshirilmoqda</Badge>}
              Topshirilgan: {formatDateTime(sub.updated_at)}
            </div>
            <Thumbs urls={subUrls} onOpen={(i) => setBox({ images: subUrls, start: i })} />
            {sub.note && <p className="mt-3 rounded-lg bg-brand-soft px-3 py-2 text-sm">{sub.note}</p>}
          </div>
        )}

        {!graded && (
          <div className="mt-4 rounded-xl border border-line bg-surface p-4">
            <h3 className="mb-1 text-base font-bold">{sub ? "Qayta topshirish" : "Vazifani topshirish"}</h3>
            <p className="mb-3 text-sm text-muted">
              {sub
                ? "Yangi rasmlar oldingilarining o'rniga qo'yiladi. Ustoz baholaguncha almashtirish mumkin."
                : "Daftaringizni sahifama-sahifa rasmga oling. Yozuvlar aniq o'qilsin."}
            </p>
            <ImagePicker items={items} onChange={setItems} />
            <textarea
              className="input mt-3"
              rows={2}
              placeholder="Ustozga izoh (ixtiyoriy)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={2000}
            />
            {sending && <div className="mt-3"><ProgressBar value={progress} max={100} /></div>}
            <Button className="mt-3 w-full" onClick={send} loading={sending} disabled={!items.length}>
              <Send size={16} /> {sub ? "Qayta topshirish" : "Topshirish"}
            </Button>
          </div>
        )}
      </section>

      {box && <Lightbox images={box.images} start={box.start} onClose={() => setBox(null)} />}
    </div>
  );
}
