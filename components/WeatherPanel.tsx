'use client';

import { motion } from 'framer-motion';
import type { WeatherData } from '@/types';

interface WeatherPanelProps {
  cities: WeatherData[];
  loading: boolean;
}

const WEATHER_EMOJI: Record<string, string> = {
  Sereno: '☀️',
  'Prevalentemente sereno': '🌤',
  'Parzialmente nuvoloso': '⛅',
  Coperto: '☁️',
  Nebbia: '🌫',
  'Pioviggine leggera': '🌦',
  'Pioggia leggera': '🌧',
  'Pioggia moderata': '🌧',
  'Pioggia intensa': '🌧',
  Temporale: '⛈',
  'Neve leggera': '🌨',
  default: '🌡',
};

function weatherEmoji(desc: string) {
  return WEATHER_EMOJI[desc] || WEATHER_EMOJI.default;
}

export default function WeatherPanel({ cities, loading }: WeatherPanelProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-cyan-900/30 px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-cyan-500">◎</span>
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-400">METEO</h2>
            <p className="text-[8px] uppercase tracking-widest text-cyan-800">Open-Meteo Live</p>
          </div>
        </div>
        <span className="rounded-full bg-cyan-950/50 px-2 py-0.5 font-mono text-[10px] text-cyan-500">
          {cities.length}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto px-1 py-1">
        {loading && cities.length === 0 ? (
          <Skeleton />
        ) : (
          <div className="flex flex-col gap-0.5">
            {cities.map((w, i) => {
              const alertColor =
                w.alertLevel === 'warning' ? 'text-red-400' :
                w.alertLevel === 'watch' ? 'text-orange-400' :
                w.alertLevel === 'advisory' ? 'text-amber-400' :
                'text-emerald-400';

              return (
                <motion.div
                  key={w.city}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.025 }}
                  className="flex items-center justify-between rounded px-2 py-1 transition-colors hover:bg-cyan-950/20"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{weatherEmoji(w.weatherDescription)}</span>
                    <span className="text-[11px] text-cyan-300">{w.city}</span>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <span className={`font-mono text-[12px] font-bold ${alertColor}`}>
                      {Math.round(w.temperature)}°
                    </span>
                    <span className="text-[9px] text-cyan-700">
                      {w.windSpeed.toFixed(0)} km/h
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="flex flex-col gap-2 p-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex justify-between">
          <div className="h-3 w-20 animate-pulse rounded bg-cyan-950/40" />
          <div className="h-3 w-10 animate-pulse rounded bg-cyan-950/40" />
        </div>
      ))}
    </div>
  );
}
