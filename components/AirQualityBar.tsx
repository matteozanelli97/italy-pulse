'use client';

import { motion } from 'framer-motion';
import type { AirQualityStation } from '@/types';

interface AirQualityBarProps {
  stations: AirQualityStation[];
}

const LEVEL_COLORS: Record<string, string> = {
  good: '#00ff88',
  moderate: '#88ff00',
  unhealthy_sensitive: '#ffaa00',
  unhealthy: '#ff4444',
  very_unhealthy: '#aa00ff',
  hazardous: '#ff0044',
};

const LEVEL_LABELS: Record<string, string> = {
  good: 'Buona',
  moderate: 'Moderata',
  unhealthy_sensitive: 'Sensibili',
  unhealthy: 'Insalubre',
  very_unhealthy: 'Molto Insalubre',
  hazardous: 'Pericolosa',
};

export default function AirQualityBar({ stations }: AirQualityBarProps) {
  if (stations.length === 0) return null;

  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="flex h-8 items-center gap-4 overflow-x-auto border-t border-cyan-900/30 bg-[#0a0a12]/90 px-4 backdrop-blur-sm"
    >
      <span className="flex-shrink-0 text-[9px] uppercase tracking-[0.2em] text-cyan-700">AQI</span>
      {stations.map((st) => {
        const color = LEVEL_COLORS[st.level] || '#888';
        return (
          <div key={st.id} className="flex flex-shrink-0 items-center gap-1.5">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}60` }}
            />
            <span className="text-[10px] text-cyan-400">{st.name}</span>
            <span className="font-mono text-[10px] font-bold" style={{ color }}>
              {st.aqi}
            </span>
            <span className="text-[8px] text-cyan-700">{LEVEL_LABELS[st.level] || st.level}</span>
          </div>
        );
      })}
    </motion.div>
  );
}
