import { useEffect, useRef, useState } from "react";
import { Camera, ImagePlus, X } from "lucide-react";
import { compressImage } from "../utils";
import { useToast } from "./Toast";

const MAX = 10;

/**
 * Daftar sahifalarini rasmga olish yoki galereyadan tanlash.
 * `files` — { file, url } ro'yxati; ota komponent holatni boshqaradi.
 */
export default function ImagePicker({ items, onChange }) {
  const toast = useToast();
  const cameraRef = useRef(null);
  const galleryRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  // Sahifadan chiqqanda xotirani tozalaymiz
  useEffect(() => () => itemsRef.current.forEach((it) => URL.revokeObjectURL(it.url)), []);

  const add = async (fileList) => {
    const picked = Array.from(fileList || []).filter((f) => f.type.startsWith("image/"));
    if (!picked.length) return;
    const room = MAX - items.length;
    if (picked.length > room) toast(`Ko'pi bilan ${MAX} ta rasm yuklash mumkin.`, "error");
    setBusy(true);
    // Ketma-ket ishlaymiz: telefon xotirasi to'lib qolmasligi uchun
    const ready = [];
    for (const f of picked.slice(0, Math.max(room, 0))) ready.push(await compressImage(f));
    setBusy(false);
    onChange([...items, ...ready.map((file) => ({ file, url: URL.createObjectURL(file) }))]);
  };

  const remove = (idx) => {
    URL.revokeObjectURL(items[idx].url);
    onChange(items.filter((_, i) => i !== idx));
  };

  const pickBtn =
    "flex h-12 flex-1 items-center justify-center gap-2 rounded-lg border border-line bg-surface text-sm font-semibold hover:bg-brand-soft disabled:opacity-50";

  return (
    <div>
      <div className="flex gap-2">
        <button type="button" className={pickBtn} onClick={() => cameraRef.current.click()} disabled={busy || items.length >= MAX}>
          <Camera size={18} /> Kamera
        </button>
        <button type="button" className={pickBtn} onClick={() => galleryRef.current.click()} disabled={busy || items.length >= MAX}>
          <ImagePlus size={18} /> Galereya
        </button>
      </div>
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden"
        onChange={(e) => { add(e.target.files); e.target.value = ""; }} />
      <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden"
        onChange={(e) => { add(e.target.files); e.target.value = ""; }} />

      {busy && <p className="mt-3 text-sm text-muted">Rasm tayyorlanmoqda...</p>}

      {items.length > 0 && (
        <ol className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {items.map((it, idx) => (
            <li key={it.url} className="relative aspect-[3/4] overflow-hidden rounded-lg border border-line bg-bg">
              <img src={it.url} alt={`Sahifa ${idx + 1}`} className="h-full w-full object-cover" />
              <span className="absolute left-1 top-1 rounded bg-ink/70 px-1.5 text-xs font-semibold text-bg">{idx + 1}</span>
              <button type="button" onClick={() => remove(idx)} aria-label={`${idx + 1}-rasmni olib tashlash`}
                className="absolute right-1 top-1 grid h-7 w-7 place-items-center rounded-full bg-ink/70 text-bg hover:bg-ink">
                <X size={14} />
              </button>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
