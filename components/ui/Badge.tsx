import type { CategoriaNotizia } from "@/types";

const categoriaColori: Record<CategoriaNotizia, string> = {
  politica: "bg-blue-600/20 text-blue-400 border-blue-600/30",
  economia: "bg-verde/20 text-green-400 border-verde/30",
  cronaca: "bg-yellow-600/20 text-yellow-400 border-yellow-600/30",
  intrattenimento: "bg-purple-600/20 text-purple-400 border-purple-600/30",
  scioperi: "bg-rosso/20 text-red-400 border-rosso/30",
};

const categoriaNomi: Record<CategoriaNotizia, string> = {
  politica: "Politica",
  economia: "Economia",
  cronaca: "Cronaca",
  intrattenimento: "Intrattenimento",
  scioperi: "Scioperi",
};

interface BadgeProps {
  categoria: CategoriaNotizia;
}

export default function Badge({ categoria }: BadgeProps) {
  return (
    <span
      className={`inline-block rounded border px-2 py-0.5 text-xs font-medium uppercase tracking-wider ${categoriaColori[categoria]}`}
    >
      {categoriaNomi[categoria]}
    </span>
  );
}
