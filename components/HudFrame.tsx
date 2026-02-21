'use client';

import { motion } from 'framer-motion';

export default function HudFrame({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="relative h-screen w-screen overflow-hidden bg-[#050508]"
    >
      {/* Corner accents */}
      <div className="pointer-events-none absolute inset-0 z-50">
        {/* Top-left */}
        <svg className="absolute left-2 top-2 h-8 w-8 text-cyan-500/60" viewBox="0 0 32 32">
          <path d="M0 12 L0 0 L12 0" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        {/* Top-right */}
        <svg className="absolute right-2 top-2 h-8 w-8 text-cyan-500/60" viewBox="0 0 32 32">
          <path d="M20 0 L32 0 L32 12" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        {/* Bottom-left */}
        <svg className="absolute bottom-2 left-2 h-8 w-8 text-cyan-500/60" viewBox="0 0 32 32">
          <path d="M0 20 L0 32 L12 32" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        {/* Bottom-right */}
        <svg className="absolute bottom-2 right-2 h-8 w-8 text-cyan-500/60" viewBox="0 0 32 32">
          <path d="M20 32 L32 32 L32 20" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>

        {/* Scanline overlay */}
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,255,255,0.015)_2px,rgba(0,255,255,0.015)_4px)]" />
      </div>

      {/* Thin border glow */}
      <div className="pointer-events-none absolute inset-1 rounded border border-cyan-900/30" />

      {children}
    </motion.div>
  );
}
