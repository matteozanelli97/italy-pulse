'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';
import type { ChatMessage } from '@/types';

const AVATAR_COLORS = ['#4C90F0', '#6BABF7', '#32A467', '#EC9A3C', '#E76A6E', '#738091', '#ABB3BF'];
const CITIES = ['Roma', 'Milano', 'Napoli', 'Torino', 'Firenze', 'Bologna', 'Venezia', 'Palermo', 'Genova', 'Bari'];
const NAMES = ['Marco_IT', 'Giulia_MI', 'Luca_RM', 'Sara_NA', 'Paolo_TO', 'Chiara_FI', 'Andrea_BO', 'Valentina_VE', 'Matteo_PA', 'Elena_GE'];

function generateBotMessages(): ChatMessage[] {
  const msgs: ChatMessage[] = [
    { id: 'sys-1', nickname: 'Sistema', avatar: 'S', message: 'Benvenuti nella chat live di Italy Pulse.', timestamp: new Date(Date.now() - 300000).toISOString(), location: 'Server' },
  ];
  const templates = [
    'Traffico intenso sull\'autostrada', 'Cielo molto scuro qui, possibile temporale',
    'Spread in salita, mercati nervosi', 'Qualità dell\'aria pessima oggi',
    'Rete ferroviaria regolare', 'Aggiornamento: situazione meteo in peggioramento',
  ];
  for (let i = 0; i < 4; i++) {
    const name = NAMES[Math.floor(Math.random() * NAMES.length)];
    msgs.push({
      id: `bot-${i}`, nickname: name, avatar: name.charAt(0).toUpperCase(),
      message: templates[Math.floor(Math.random() * templates.length)],
      timestamp: new Date(Date.now() - Math.random() * 600000).toISOString(),
      location: CITIES[Math.floor(Math.random() * CITIES.length)],
    });
  }
  return msgs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

export default function LiveChat() {
  const open = useStore((s) => s.chatOpen);
  const setOpen = useStore((s) => s.setChatOpen);
  const [messages, setMessages] = useState<ChatMessage[]>(() => generateBotMessages());
  const [input, setInput] = useState('');
  const [nickname] = useState(() => NAMES[Math.floor(Math.random() * NAMES.length)]);
  const [location] = useState(() => CITIES[Math.floor(Math.random() * CITIES.length)]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open]);

  useEffect(() => {
    const interval = setInterval(() => {
      const name = NAMES[Math.floor(Math.random() * NAMES.length)];
      const templates = [
        'Qualcuno ha notizie sulla situazione meteo?', 'Segnalo ritardi sulla linea ferroviaria',
        'Tutto tranquillo qui', 'Mercati in ripresa',
        'Aggiornamento: traffico in miglioramento', 'Pioggia leggera nella zona',
      ];
      const newMsg: ChatMessage = {
        id: `sim-${Date.now()}`, nickname: name, avatar: name.charAt(0).toUpperCase(),
        message: templates[Math.floor(Math.random() * templates.length)],
        timestamp: new Date().toISOString(),
        location: CITIES[Math.floor(Math.random() * CITIES.length)],
      };
      setMessages((prev) => [...prev.slice(-40), newMsg]);
    }, 18000 + Math.random() * 25000);
    return () => clearInterval(interval);
  }, []);

  const send = useCallback(() => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev.slice(-40), {
      id: `user-${Date.now()}`, nickname, avatar: nickname.charAt(0).toUpperCase(),
      message: input.trim(), timestamp: new Date().toISOString(), location,
    }]);
    setInput('');
  }, [input, nickname, location]);

  const avatarColor = (name: string) => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

  return (
    <div className="flex-shrink-0 border-t" style={{ borderColor: 'var(--border-dim)', background: 'var(--bg-panel)' }}>
      <button onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 px-4 py-2 hover:bg-[var(--bg-hover)] transition-colors">
        <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
          <path d="M2 3h12v8H5l-3 3V3z" stroke="var(--accent)" strokeWidth="1.3" strokeLinejoin="round" />
        </svg>
        <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Live Chat</span>
        <span className="flex items-center gap-1.5 text-[10px] font-mono" style={{ color: '#32A467' }}>
          <span className="h-1.5 w-1.5 rounded-full animate-glow-breathe" style={{ background: '#32A467' }} />
          Online
        </span>
        <div className="flex-1" />
        <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
          <path d="M4 6l4 4 4-4" stroke="var(--text-dim)" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 280 }} exit={{ height: 0 }}
            transition={{ duration: 0.25 }} className="overflow-hidden flex flex-col">
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2" style={{ maxHeight: 230 }}>
              {messages.map((msg) => {
                const isSystem = msg.nickname === 'Sistema';
                const isMe = msg.nickname === nickname;
                const color = avatarColor(msg.nickname);
                return (
                  <div key={msg.id} className={`chat-msg flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                    <div className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold font-mono"
                      style={{ background: isSystem ? 'rgba(45,114,210,0.1)' : `${color}15`, color: isSystem ? 'var(--accent)' : color }}>
                      {msg.avatar}
                    </div>
                    <div className={`max-w-[240px] ${isMe ? 'text-right' : ''}`}>
                      <div className="flex items-center gap-1 mb-0.5" style={isMe ? { justifyContent: 'flex-end' } : undefined}>
                        <span className="text-[9px] font-semibold" style={{ color: isSystem ? 'var(--accent)' : color }}>{msg.nickname}</span>
                        <span className="text-[8px]" style={{ color: 'var(--text-muted)' }}>{msg.location}</span>
                      </div>
                      <div className="rounded-lg px-2.5 py-1.5 text-[11px] leading-relaxed inline-block"
                        style={{
                          background: isSystem ? 'rgba(45,114,210,0.06)' : isMe ? 'rgba(45,114,210,0.08)' : 'var(--bg-card)',
                          color: 'var(--text-secondary)',
                          border: `1px solid ${isSystem ? 'rgba(45,114,210,0.12)' : 'var(--border-dim)'}`,
                        }}>
                        {msg.message}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="border-t px-3 py-2" style={{ borderColor: 'var(--border-dim)' }}>
              <div className="flex items-center gap-2">
                <input value={input} onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && send()}
                  placeholder="Scrivi..." className="flex-1 rounded-lg px-3 py-1.5 text-[11px] outline-none"
                  style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-dim)' }} />
                <button onClick={send} className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors"
                  style={{ background: 'var(--accent-muted)', border: '1px solid var(--border-medium)' }}>
                  <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
                    <path d="M2 8l12-5-5 12-2-5-5-2z" stroke="var(--accent)" strokeWidth="1.3" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
