const MONTHS = [
  "yanvar", "fevral", "mart", "aprel", "may", "iyun",
  "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr",
];

const pad = (n) => String(n).padStart(2, "0");
const timeStr = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

export function formatDateTime(iso) {
  const d = new Date(iso);
  return `${d.getDate()}-${MONTHS[d.getMonth()]}, ${timeStr(d)}`;
}

export function initials(name = "") {
  return name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join("") || "?";
}

/** Telefon rasmini yuklashdan oldin kichraytiradi (tez yuklanadi, trafik tejaladi) */
export async function compressImage(file, maxSide = 1600, quality = 0.82) {
  if (!file.type.startsWith("image/")) return file;
  try {
    maxSide = Number(maxSide) > 0 ? Number(maxSide) : 1600;
    const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
    const w = Math.round(bmp.width * scale);
    const h = Math.round(bmp.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    canvas.getContext("2d").drawImage(bmp, 0, 0, w, h);
    const blob = await new Promise((res) => canvas.toBlob(res, "image/jpeg", quality));
    if (!blob || (scale === 1 && blob.size >= file.size)) return file;
    const name = (file.name || "rasm").replace(/\.\w+$/, "") + ".jpg";
    return new File([blob], name, { type: "image/jpeg" });
  } catch {
    return file;
  }
}

export const SUBJECTS = [
  "Matematika", "Ona tili", "Adabiyot", "Ingliz tili", "Rus tili", "Fizika",
  "Kimyo", "Biologiya", "Tarix", "Geografiya", "Informatika", "Algebra", "Geometriya",
];

/** Fan nomiga qarab rasmdagi dizaynga mos rang toni (ikonka/chip uchun) */
const SUBJECT_TONES = ["ok", "brand", "warn", "pen"];
export function subjectTone(subject = "") {
  let h = 0;
  for (let i = 0; i < subject.length; i++) h = (h * 31 + subject.charCodeAt(i)) % 997;
  return SUBJECT_TONES[h % SUBJECT_TONES.length];
}

export function formatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return timeStr(d);
}

export function formatDayLabel(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getDate()}-${MONTHS[d.getMonth()]}`;
}

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

/** Sana bugun/ertaga/o'sha kundan keyingi ekanini aniqlaydi ("today" | "tomorrow" | "later" | "past") */
export function dayBucket(iso) {
  if (!iso) return "none";
  const today = startOfDay(new Date());
  const day = startOfDay(new Date(iso));
  const diff = Math.round((day - today) / 86400000);
  if (diff < 0) return "past";
  if (diff === 0) return "today";
  if (diff === 1) return "tomorrow";
  return "later";
}
