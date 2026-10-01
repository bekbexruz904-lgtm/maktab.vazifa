/** Baho doirasi: 5 — yashil, 4 — ko'k, 3 — to'q sariq, 1-2 — qizil */
export function gradeTone(value) {
  if (value >= 5) return "ok";
  if (value === 4) return "brand";
  if (value === 3) return "warn";
  return "pen";
}

const FILL = {
  ok: "bg-ok",
  brand: "bg-brand",
  warn: "bg-warn",
  pen: "bg-pen",
};
const RING = {
  ok: "border-ok bg-ok text-white",
  brand: "border-brand bg-brand text-white",
  warn: "border-warn bg-warn text-white",
  pen: "border-pen bg-pen text-white",
};

/** Kichik doirachalar/ro'yxatlarda ko'rinadigan to'ldirilgan baho belgisi */
export default function GradeMark({ value, size = 48 }) {
  const tone = gradeTone(value);
  return (
    <span
      className={`inline-grid shrink-0 place-items-center rounded-full font-display font-extrabold leading-none text-white shadow-sm ${FILL[tone]}`}
      style={{ width: size, height: size, fontSize: size * 0.42 }}
      aria-label={`Baho: ${value}`}
      title={`Baho: ${value}`}
    >
      {value}
    </span>
  );
}

/** Baho tanlash tugmalari uchun (masalan, ustoz tekshiruv oynasida) */
export function gradeButtonClass(value, active) {
  return active ? RING[gradeTone(value)] : "border-line hover:bg-brand-soft";
}
