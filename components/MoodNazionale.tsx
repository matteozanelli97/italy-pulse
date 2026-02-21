"use client";

import { useEffect, useState } from "react";
import type { MoodNazionaleData, PesiSentiment } from "@/types";
import { nomiPesi, emojiPesi } from "@/lib/sentiment/weights";

interface MoodNazionaleProps {
  data: MoodNazionaleData;
}

export default function MoodNazionale({ data }: MoodNazionaleProps) {
  const [displayValue, setDisplayValue] = useState(0);

  // Animazione contatore
  useEffect(() => {
    const target = data.valore;
    const duration = 1500;
    const start = performance.now();

    function animate(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Easing: ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(eased * target));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }, [data.valore]);

  const fattoriKeys = Object.keys(data.fattori) as (keyof PesiSentiment)[];

  return (
    <section className="flex flex-col items-center gap-6 py-12">
      {/* Label */}
      <h2
        className="text-sm font-medium uppercase tracking-[0.3em] text-[var(--grigio-testo)]"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        Mood Nazionale
      </h2>

      {/* Numero grande animato */}
      <div className="relative flex items-center justify-center">
        <div
          className="animate-pulse-mood flex h-48 w-48 items-center justify-center rounded-full border-2 sm:h-56 sm:w-56"
          style={{ borderColor: data.colore }}
        >
          <span
            className="text-8xl font-bold leading-none sm:text-9xl"
            style={{
              color: data.colore,
              fontFamily: "'Bebas Neue', sans-serif",
            }}
          >
            {displayValue}
          </span>
        </div>
      </div>

      {/* Emoji e frase ironica */}
      <div className="flex flex-col items-center gap-2">
        <span className="text-4xl">{data.emoji}</span>
        <p className="max-w-md text-center text-lg italic text-[var(--grigio-testo)]">
          &ldquo;{data.frase}&rdquo;
        </p>
      </div>

      {/* Breakdown fattori */}
      <div className="mt-4 grid w-full max-w-lg grid-cols-2 gap-3 sm:grid-cols-3">
        {fattoriKeys.map((key) => (
          <div
            key={key}
            className="flex flex-col items-center gap-1 rounded border border-[var(--grigio-chiaro)] bg-[var(--grigio-scuro)] p-3"
          >
            <span className="text-lg">{emojiPesi[key]}</span>
            <span className="text-xs text-[var(--grigio-testo)]">
              {nomiPesi[key]}
            </span>
            <span className="text-lg font-bold" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              {data.fattori[key]}
            </span>
          </div>
        ))}
      </div>

      {/* Timestamp */}
      <p className="text-xs text-[var(--grigio-testo)]">
        Ultimo aggiornamento:{" "}
        {new Date(data.aggiornamento).toLocaleString("it-IT", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
    </section>
  );
}
