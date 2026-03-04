'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';
import type { ChatMessage } from '@/types';

export default function LiveChat() {
  const open = useStore((s) => s.chatOpen);
  const setOpen = useStore((s) => s.setChatOpen);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'sys-1', nickname: 'Sistema', avatar: 'S', message: 'Benvenuti nella live chat di Italy Pulse. Registrati per partecipare.', timestamp: new Date().toISOString(), location: 'Server' },
  ]);
  const [input, setInput] = useState('');
  const [profile, setProfile] = useState<{ nickname: string; email: string; avatar: string } | null>(null);
  const [regStep, setRegStep] = useState<'nickname' | 'email' | 'done'>('nickname');
  const [regNick, setRegNick] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regError, setRegError] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open]);

  const completeRegistration = useCallback(() => {
    if (!regEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) { setRegError('Email non valida'); return; }
    setProfile({ nickname: regNick, email: regEmail, avatar: regNick.charAt(0).toUpperCase() });
    setRegStep('done');
    setRegError('');
    setMessages((prev) => [...prev, {
      id: `join-${Date.now()}`, nickname: 'Sistema', avatar: 'S',
      message: `${regNick} si è unito alla chat.`, timestamp: new Date().toISOString(), location: 'Server',
    }]);
  }, [regNick, regEmail]);

  const send = useCallback(() => {
    if (!input.trim() || !profile) return;
    setMessages((prev) => [...prev.slice(-50), {
      id: `user-${Date.now()}`, nickname: profile.nickname, avatar: profile.avatar,
      message: input.trim(), timestamp: new Date().toISOString(), location: 'Italia',
    }]);
    setInput('');
  }, [input, profile]);

  const COLORS = ['#4C90F0', '#6BABF7', '#32A467', '#EC9A3C', '#E76A6E', '#738091'];
  const avatarColor = (name: string) => COLORS[name.charCodeAt(0) % COLORS.length];

  return (
    <div className="flex-shrink-0 border-t" style={{ borderColor: 'var(--border-dim)', background: 'var(--bg-panel)' }}>
      <button onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 px-4 py-2 hover:bg-[var(--bg-hover)] transition-colors">
        <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5"><path d="M2 3h12v8H5l-3 3V3z" stroke="var(--accent)" strokeWidth="1.3" strokeLinejoin="round" /></svg>
        <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Live Chat</span>
        {profile && <span className="text-[9px] font-mono" style={{ color: '#32A467' }}>{profile.nickname}</span>}
        <div className="flex-1" />
        <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
          <path d="M4 6l4 4 4-4" stroke="var(--text-dim)" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 280 }} exit={{ height: 0 }}
            transition={{ duration: 0.25 }} className="overflow-hidden flex flex-col">

            {!profile ? (
              /* Registration form */
              <div className="flex-1 flex flex-col items-center justify-center p-4 gap-3">
                <span className="text-[12px] font-semibold" style={{ color: 'var(--text-primary)' }}>Registrati per chattare</span>
                {regStep === 'nickname' ? (
                  <div className="w-full max-w-[240px] space-y-2">
                    <input value={regNick} onChange={(e) => setRegNick(e.target.value)} placeholder="Scegli un nickname..."
                      className="w-full rounded-lg px-3 py-2 text-[11px] outline-none" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-dim)' }} />
                    <button onClick={() => { if (regNick.trim().length < 3) { setRegError('Min. 3 caratteri'); return; } setRegError(''); setRegStep('email'); }}
                      className="w-full rounded-lg py-2 text-[11px] font-semibold" style={{ background: 'var(--accent-muted)', color: 'var(--accent)', border: '1px solid var(--border-medium)' }}>
                      Continua
                    </button>
                  </div>
                ) : (
                  <div className="w-full max-w-[240px] space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full text-[14px] font-bold"
                        style={{ background: `${avatarColor(regNick)}20`, color: avatarColor(regNick) }}>
                        {regNick.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-[11px] font-semibold" style={{ color: '#fff' }}>{regNick}</span>
                    </div>
                    <input value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="Email di verifica..."
                      type="email" className="w-full rounded-lg px-3 py-2 text-[11px] outline-none" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-dim)' }} />
                    <button onClick={completeRegistration}
                      className="w-full rounded-lg py-2 text-[11px] font-semibold" style={{ background: 'var(--accent-muted)', color: 'var(--accent)', border: '1px solid var(--border-medium)' }}>
                      Entra in chat
                    </button>
                  </div>
                )}
                {regError && <span className="text-[10px]" style={{ color: '#E76A6E' }}>{regError}</span>}
              </div>
            ) : (
              /* Chat area */
              <>
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2" style={{ maxHeight: 230 }}>
                  {messages.map((msg) => {
                    const isSystem = msg.nickname === 'Sistema';
                    const isMe = msg.nickname === profile.nickname;
                    const color = avatarColor(msg.nickname);
                    return (
                      <div key={msg.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                        <div className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold font-mono"
                          style={{ background: isSystem ? 'rgba(45,114,210,0.1)' : `${color}15`, color: isSystem ? 'var(--accent)' : color }}>
                          {msg.avatar}
                        </div>
                        <div className={`max-w-[240px] ${isMe ? 'text-right' : ''}`}>
                          <div className="flex items-center gap-1 mb-0.5" style={isMe ? { justifyContent: 'flex-end' } : undefined}>
                            <span className="text-[9px] font-semibold" style={{ color: isSystem ? 'var(--accent)' : color }}>{msg.nickname}</span>
                            <span className="text-[8px]" style={{ color: 'var(--text-muted)' }}>
                              {new Date(msg.timestamp).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="rounded-lg px-2.5 py-1.5 text-[11px] leading-relaxed inline-block"
                            style={{ background: isMe ? 'rgba(45,114,210,0.08)' : 'var(--bg-card)', color: 'var(--text-secondary)', border: `1px solid ${isSystem ? 'rgba(45,114,210,0.12)' : 'var(--border-dim)'}` }}>
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
                    <button onClick={send} className="flex h-7 w-7 items-center justify-center rounded-lg"
                      style={{ background: 'var(--accent-muted)', border: '1px solid var(--border-medium)' }}>
                      <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5"><path d="M2 8l12-5-5 12-2-5-5-2z" stroke="var(--accent)" strokeWidth="1.3" strokeLinejoin="round" /></svg>
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
