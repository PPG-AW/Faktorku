import { CloudRain, Frown, Laugh, Meh, Smile, type LucideIcon } from "lucide-react";

export interface MoodDef {
  key: string;
  label: string;
  icon: LucideIcon;
  color: string;
  border: string;
  bg: string;
  bar: string;
}

export const MOODS: MoodDef[] = [
  {
    key: "luar-biasa",
    label: "Luar biasa!",
    icon: Laugh,
    color: "text-amber-300",
    border: "border-amber-400/50",
    bg: "bg-amber-400/15",
    bar: "from-amber-400 to-orange-500",
  },
  {
    key: "baik",
    label: "Baik",
    icon: Smile,
    color: "text-emerald-300",
    border: "border-emerald-400/50",
    bg: "bg-emerald-400/15",
    bar: "from-emerald-500 to-emerald-300",
  },
  {
    key: "biasa",
    label: "Biasa saja",
    icon: Meh,
    color: "text-zinc-300",
    border: "border-zinc-400/40",
    bg: "bg-zinc-400/12",
    bar: "from-zinc-400 to-zinc-500",
  },
  {
    key: "kurang-baik",
    label: "Kurang baik",
    icon: Frown,
    color: "text-sky-300",
    border: "border-sky-400/50",
    bg: "bg-sky-400/15",
    bar: "from-sky-500 to-sky-300",
  },
  {
    key: "butuh-semangat",
    label: "Butuh semangat",
    icon: CloudRain,
    color: "text-violet-300",
    border: "border-violet-400/50",
    bg: "bg-violet-400/15",
    bar: "from-violet-500 to-fuchsia-400",
  },
];

export const MOOD_KEYS = MOODS.map((m) => m.key);

export function moodByKey(key: string): MoodDef {
  return MOODS.find((m) => m.key === key) ?? MOODS[2];
}
