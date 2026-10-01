import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, RotateCw, ExternalLink, X } from "lucide-react";

/** Rasmlarni to'liq ekranda ko'rish; yon tomonga olingan rasmlarni burish mumkin */
export default function Lightbox({ images, start = 0, onClose }) {
  const [i, setI] = useState(start);
  const [rot, setRot] = useState(0);
  const go = (d) => {
    setI((v) => (v + d + images.length) % images.length);
    setRot(0);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && images.length > 1) go(-1);
      if (e.key === "ArrowRight" && images.length > 1) go(1);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  });

  const btn = "grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white hover:bg-white/25";
  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-black/90" role="dialog" aria-modal="true" aria-label="Rasmni ko'rish">
      <div className="flex items-center justify-between p-3 text-white">
        <span className="text-sm">{i + 1} / {images.length}</span>
        <div className="flex gap-2">
          <button className={btn} onClick={() => setRot((r) => r + 90)} aria-label="Burish"><RotateCw size={18} /></button>
          <a className={btn} href={images[i]} target="_blank" rel="noreferrer" aria-label="Yangi oynada ochish"><ExternalLink size={18} /></a>
          <button className={btn} onClick={onClose} aria-label="Yopish"><X size={18} /></button>
        </div>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center p-2" onClick={onClose}>
        <img
          src={images[i]}
          alt={`Rasm ${i + 1}`}
          onClick={(e) => e.stopPropagation()}
          style={{ transform: `rotate(${rot}deg)` }}
          className="max-h-full max-w-full object-contain transition-transform"
        />
        {images.length > 1 && (
          <>
            <button className={`${btn} absolute left-3 top-1/2 -translate-y-1/2`} onClick={(e) => { e.stopPropagation(); go(-1); }} aria-label="Oldingi"><ChevronLeft /></button>
            <button className={`${btn} absolute right-3 top-1/2 -translate-y-1/2`} onClick={(e) => { e.stopPropagation(); go(1); }} aria-label="Keyingi"><ChevronRight /></button>
          </>
        )}
      </div>
    </div>
  );
}
