'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChatMessage } from '@/types';

const AVATAR_COLORS = ['#3b82f6', '#60a5fa', '#93bbfd', '#f59e0b', '#ef4444', '#64748b', '#94a3b8'];
const CITIES = ['Roma', 'Milano', 'Napoli', 'Torino', 'Firenze', 'Bologna', 'Venezia', 'Palermo', 'Genova', 'Bari'];
const NAMES = ['Marco_IT', 'Giulia_MI', 'Luca_RM', 'Sara_NA', 'Paolo_TO', 'Chiara_FI', 'Andrea_BO', 'Valentina_VE', 'Matteo_PA', 'Elena_GE', 'Davide_BA', 'Francesca_CT'];

function generateBotMessages(): ChatMessage[] {
  const msgs: ChatMessage[] = [
    { id: 'sys-1', nickname: 'Sistema', avatar: 'S', message: 'Benvenuti nella chat live di Italy Pulse. Condividi osservazioni e segnalazioni.', timestamp: new Date(Date.now() - 300000).toISOString(), location: 'Server' },
  ];

  const templates = [
    'Confermata scossa avvertita nella zona',
    'Traffico intenso sull\'autostrada, qualcuno conferma?',
    'Cielo molto scuro qui, possibile temporale in arrivo',
    'Spread in salita, mercati nervosi oggi',
    'Qualità dell\'aria pessima oggi, si vede la foschia',
    'Rete ferroviaria regolare da qui',
    'Segnalo nebbia fitta nella zona',
    'Temperatura in calo rispetto a ieri',
  ];

  for (let i = 0; i < 5; i++) {
    const name = NAMES[Math.floor(Math.random() * NAMES.length)];
    const city = CITIES[Math.floor(Math.random() * CITIES.length)];
    msgs.push({
      id: `bot-${i}`,
      nickname: name,
      avatar: name.charAt(0).toUpperCase(),
      message: templates[Math.floor(Math.random() * templates.length)],
      timestamp: new Date(Date.now() - Math.random() * 600000).toISOString(),
      location: city,
    });
  }

  return msgs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

export default function LiveChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => generateBotMessages());
  const [input, setInput] = useState('');
  const [nickname] = useState(() => NAMES[Math.floor(Math.random() * NAMES.length)]);
  const [location] = useState(() => CITIES[Math.floor(Math.random() * CITIES.length)]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const unreadRef = useRef(0);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      unreadRef.current = 0;
      setUnread(0);
    }
  }, [messages, open]);

  useEffect(() => {
    const interval = setInterval(() => {
      const name = NAMES[Math.floor(Math.random() * NAMES.length)];
      const city = CITIES[Math.floor(Math.random() * CITIES.length)];
      const templates = [
        'Qualcuno ha notizie sulla situazione meteo al nord?',
        'Segnalo ritardi sulla linea ferroviaria',
        'Tutto tranquillo qui',
        'Mercati in ripresa, buon segno',
        'Scossa leggera avvertita poco fa',
        'Attenzione alla qualità dell\'aria oggi',
        'Aggiornamento: traffico in miglioramento',
        'Pioggia leggera nella zona, niente di grave',
      ];
      const newMsg: ChatMessage = {
        id: `sim-${Date.now()}`,
        nickname: name,
        avatar: name.charAt(0).toUpperCase(),
        message: templates[Math.floor(Math.random() * templates.length)],
        timestamp: new Date().toISOString(),
        location: city,
      };
      setMessages((prev) => [...prev.slice(-50), newMsg]);
      if (!open) {
        unreadRef.current++;
        setUnread(unreadRef.current);
      }
    }, 15000 + Math.random() * 20000);

    return () => clearInterval(interval);
  }, [open]);

  const send = useCallback(() => {
    if (!input.trim()) return;
    const msg: ChatMessage = {
      id: `user-${Date.now()}`,
      nickname,
      avatar: nickname.charAt(0).toUpperCase(),
      message: input.trim(),
      timestamp: new Date().toISOString(),
      location,
    };
    setMessages((prev) => [...prev.slice(-50), msg]);
    setInput('');
  }, [input, nickname, location]);

  const avatarColor = (name: string) => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

  return (
    <div className="fixed bottom-4 right-4 z-[9999]">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="mb-2 flex flex-col rounded-xl overflow-hidden"
            style={{
              width: 340,
              height: 420,
              background: 'var(--bg-panel)',
              border: '1px solid var(--border-subtle)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.6), var(--glow)',
            }}
          >
            {/* Chat header */}
            <div className="flex items-center gap-2 px-3 py-2 border-b" style={{ borderColor: 'var(--border-dim)', background: 'var(--bg-deep)' }}>
              <span className="flex h-5 w-5 items-center justify-center rounded-full" style={{ background: 'rgba(59,130,246,0.1)' }}>
                <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3">
                  <path d="M2 3h12v8H5l-3 3V3z" stroke="var(--blue-500)" strokeWidth="1.3" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Live Chat</span>
              <span className="flex items-center gap-1 text-[9px]" style={{ color: 'var(--blue-400)' }}>
                <span className="h-1.5 w-1.5 rounded-full animate-glow-breathe" style={{ background: 'var(--blue-500)' }} />
                Online
              </span>
              <div className="flex-1" />
              <span className="text-[9px]" style={{ color: 'var(--text-dim)' }}>{nickname} · {location}</span>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 space-y-2">
              {messages.map((msg) => {
                const isSystem = msg.nickname === 'Sistema';
                const isMe = msg.nickname === nickname;
                const color = avatarColor(msg.nickname);
                return (
                  <div key={msg.id} className={`chat-msg flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                    <div className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold"
                      style={{ background: isSystem ? 'rgba(59,130,246,0.1)' : `${color}15`, color: isSystem ? 'var(--blue-400)' : color, border: `1px solid ${isSystem ? 'rgba(59,130,246,0.2)' : `${color}30`}` }}>
                      {msg.avatar}
                    </div>
                    <div className={`max-w-[240px] ${isMe ? 'text-right' : ''}`}>
                      <div className="flex items-center gap-1.5 mb-0.5" style={isMe ? { justifyContent: 'flex-end' } : undefined}>
                        <span className="text-[9px] font-semibold" style={{ color: isSystem ? 'var(--blue-400)' : color }}>{msg.nickname}</span>
                        <span className="text-[8px]" style={{ color: 'var(--text-muted)' }}>{msg.location}</span>
                        <span className="text-[8px] font-mono" style={{ color: 'var(--text-muted)' }}>
                          {new Date(msg.timestamp).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="rounded-lg px-2.5 py-1.5 text-[11px] leading-relaxed inline-block"
                        style={{
                          background: isSystem ? 'rgba(59,130,246,0.06)' : isMe ? 'rgba(59,130,246,0.08)' : 'var(--bg-card)',
                          color: 'var(--text-secondary)',
                          border: `1px solid ${isSystem ? 'rgba(59,130,246,0.12)' : isMe ? 'rgba(59,130,246,0.15)' : 'var(--border-dim)'}`,
                        }}>
                        {msg.message}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input */}
            <div className="border-t px-2 py-2" style={{ borderColor: 'var(--border-dim)' }}>
              <div className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && send()}
                  placeholder="Scrivi un messaggio..."
                  className="flex-1 rounded-lg px-3 py-1.5 text-[11px] outline-none"
                  style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-dim)' }}
                />
                <button
                  onClick={send}
                  className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
                  style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.15)' }}
                >
                  <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
                    <path d="M2 8l12-5-5 12-2-5-5-2z" stroke="var(--blue-500)" strokeWidth="1.3" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <button
        onClick={() => { setOpen(!open); setUnread(0); unreadRef.current = 0; }}
        className="flex h-12 w-12 items-center justify-center rounded-full transition-all hover:scale-105"
        style={{
          background: open ? 'rgba(59,130,246,0.12)' : 'var(--bg-panel)',
          border: `1px solid ${open ? 'rgba(59,130,246,0.25)' : 'var(--border-subtle)'}`,
          boxShadow: open ? '0 0 20px rgba(59,130,246,0.15)' : '0 4px 20px rgba(0,0,0,0.4)',
        }}
      >
        {open ? (
          <svg viewBox="0 0 16 16" fill="none" className="h-5 w-5">
            <path d="M4 4l8 8M12 4l-8 8" stroke="var(--blue-400)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 16 16" fill="none" className="h-5 w-5">
            <path d="M2 3h12v8H5l-3 3V3z" stroke="var(--blue-400)" strokeWidth="1.3" strokeLinejoin="round" />
            <circle cx="5" cy="7" r="0.8" fill="var(--blue-400)" />
            <circle cx="8" cy="7" r="0.8" fill="var(--blue-400)" />
            <circle cx="11" cy="7" r="0.8" fill="var(--blue-400)" />
          </svg>
        )}
        {unread > 0 && !open && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold"
            style={{ background: '#dc2626', color: 'white' }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
    </div>
  );
}
