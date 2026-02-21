import type { TickerItem } from "@/types";

interface TickerLiveProps {
  items: TickerItem[];
}

const trendColors: Record<string, string> = {
  up: "text-green-400",
  down: "text-red-400",
  stable: "text-gray-400",
};

export default function TickerLive({ items }: TickerLiveProps) {
  // Duplichiamo gli item per creare un loop infinito
  const duplicated = [...items, ...items];

  return (
    <div className="w-full overflow-hidden border-y border-[var(--grigio-chiaro)] bg-[var(--grigio-scuro)]">
      <div className="animate-ticker flex whitespace-nowrap py-2.5">
        {duplicated.map((item, i) => (
          <div
            key={`${item.label}-${i}`}
            className="flex items-center gap-2 px-6"
          >
            <span className="text-[10px] font-medium uppercase tracking-widest text-[var(--grigio-testo)]">
              {item.label}
            </span>
            <span
              className={`text-xs font-semibold ${trendColors[item.trend ?? "stable"]}`}
            >
              {item.valore}
            </span>
            <span className="text-[var(--grigio-chiaro)]">│</span>
          </div>
        ))}
      </div>
    </div>
  );
}
