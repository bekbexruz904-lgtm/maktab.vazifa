import { useEffect, useState } from "react";
import { ImagePlus } from "lucide-react";
import { createAssignment, errorMessage, fetchClasses } from "../api";
import { Button, ErrorNote, Field, Modal } from "../components/ui";
import { compressImage, SUBJECTS } from "../utils";

export default function AssignmentFormModal({ onClose, onCreated }) {
  const [classes, setClasses] = useState([]);
  const [f, setF] = useState({ title: "", subject: "", description: "", school_class: "" });
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClasses().then(setClasses).catch(() => {});
  }, []);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData();
    Object.entries(f).forEach(([k, v]) => {
      if (v) fd.append(k, v);
    });
    if (file) fd.append("attachment", file);
    try {
      const created = await createAssignment(fd);
      onCreated(created);
    } catch (err) {
      setError(errorMessage(err));
      setLoading(false);
    }
  };

  return (
    <Modal title="Yangi vazifa" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <ErrorNote>{error}</ErrorNote>
        <Field label="Vazifa nomi">
          <input className="input" value={f.title} onChange={set("title")} required maxLength={200} placeholder="Masalan: 5-mashq, 3 va 4-masalalar" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Fan">
            <input className="input" list="subjects" value={f.subject} onChange={set("subject")} placeholder="Matematika" />
            <datalist id="subjects">{SUBJECTS.map((s) => <option key={s} value={s} />)}</datalist>
          </Field>
          <Field label="Sinf">
            <select className="input" value={f.school_class} onChange={set("school_class")} required>
              <option value="">Sinfni tanlang</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Topshiriq matni">
          <textarea className="input" rows={4} value={f.description} onChange={set("description")} required placeholder="Nima qilish kerakligini yozing" />
        </Field>
        <div>
          <span className="mb-1 block text-sm font-medium">Rasm biriktirish <span className="font-normal text-muted">(ixtiyoriy)</span></span>
          <label className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-line text-sm font-semibold text-muted hover:bg-brand-soft">
            <ImagePlus size={18} /> {file ? file.name : "Rasm tanlash"}
            <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
              const picked = e.target.files?.[0];
              if (picked) setFile(await compressImage(picked));
            }} />
          </label>
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>Bekor qilish</Button>
          <Button type="submit" loading={loading}>Vazifa qo'shish</Button>
        </div>
      </form>
    </Modal>
  );
}
