import { useState } from "react";
import { Bell, BookOpen, Trophy } from "lucide-react";
import { Button } from "../components/ui";

const SLIDES = [
  { icon: BookOpen, title: "Maktab Vazifa", text: "Darslaringni tartibga sol. Vazifalarni vaqtida topshir." },
  { icon: Bell, title: "O'qituvchi bilan yaqin aloqa", text: "Vazifalar, xabarlar va baholar bir joyda." },
  { icon: Trophy, title: "O'sish va yutuqlar", text: "Har bir muvaffaqiyat sizni orzularingizga yaqinlashtiradi." },
];

export default function Onboarding({ onDone }) {
  const [i, setI] = useState(0);
  const { icon: Icon, title, text } = SLIDES[i];
  const last = i === SLIDES.length - 1;
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-between px-6 py-10">
      <button onClick={onDone} className="self-end text-sm font-semibold text-muted">O'tkazib yuborish</button>
      <div className="text-center">
        <div className="mx-auto grid h-40 w-40 place-items-center rounded-3xl bg-brand-soft text-brand">
          <Icon size={72} />
        </div>
        <h1 className="mt-8 font-display text-2xl font-extrabold">{title}</h1>
        <p className="mt-2 text-muted">{text}</p>
        <div className="mt-6 flex justify-center gap-2">
          {SLIDES.map((_, n) => (
            <span key={n} className={`h-2 rounded-full transition-all ${n === i ? "w-6 bg-brand" : "w-2 bg-line"}`} />
          ))}
        </div>
      </div>
      <Button className="w-full" onClick={() => (last ? onDone() : setI(i + 1))}>
        {i === 0 ? "Boshlash" : last ? "Boshlash" : "Keyingi"}
      </Button>
    </div>
  );
}
