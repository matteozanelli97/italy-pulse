import { NextResponse } from 'next/server';
import type { NewsItem } from '@/types';

export const dynamic = 'force-dynamic';

// AI-like analysis engine for breaking news detection and content recommendations
// Uses heuristic NLP patterns to detect urgency, categorize, and suggest relevant data modules

interface AnalysisResult {
  breakingItems: { id: string; reason: string; urgency: number }[];
  suggestedModules: string[];
  trendingTopics: { topic: string; count: number; sentiment: 'positive' | 'negative' | 'neutral' }[];
  summary: string;
}

const URGENCY_PATTERNS: { pattern: RegExp; weight: number; modules: string[]; topic: string }[] = [
  { pattern: /terremot|sismi|scoss/i, weight: 0.95, modules: ['radar', 'weather'], topic: 'Sismica' },
  { pattern: /alluvion|inondazion|esondazion/i, weight: 0.9, modules: ['weather', 'transport'], topic: 'Alluvioni' },
  { pattern: /incendio|rogo|fiamme/i, weight: 0.85, modules: ['weather', 'airquality'], topic: 'Incendi' },
  { pattern: /borsa|mercati|crash|crollo.*finanz/i, weight: 0.8, modules: ['financial', 'energy'], topic: 'Mercati' },
  { pattern: /spread|btp|debito.*pubblic/i, weight: 0.75, modules: ['financial'], topic: 'Spread' },
  { pattern: /attacca.*cyber|hacker|violazion.*dati/i, weight: 0.85, modules: ['cyber'], topic: 'Cyber' },
  { pattern: /traffico|incidente.*strad|blocco.*autostrad/i, weight: 0.6, modules: ['transport'], topic: 'Traffico' },
  { pattern: /inquinament|smog|pm10|pm2\.5/i, weight: 0.65, modules: ['airquality'], topic: 'Inquinamento' },
  { pattern: /elezion|voto|referendum/i, weight: 0.7, modules: ['intel'], topic: 'Elezioni' },
  { pattern: /guerra|conflitto|missil|bombardament/i, weight: 0.9, modules: ['intel', 'cyber'], topic: 'Conflitti' },
  { pattern: /pandemic|epidemia|virus|covid|influenza/i, weight: 0.8, modules: ['weather'], topic: 'Sanità' },
  { pattern: /tempest|uragano|ciclone|allerta.*meteo/i, weight: 0.85, modules: ['weather', 'transport'], topic: 'Meteo Estremo' },
  { pattern: /energia|blackout|rete.*elettric/i, weight: 0.7, modules: ['energy'], topic: 'Energia' },
  { pattern: /migranti|sbarc|naufrag/i, weight: 0.75, modules: ['naval', 'intel'], topic: 'Migrazione' },
  { pattern: /terroris|attentato|esplosion/i, weight: 0.95, modules: ['intel', 'cyber'], topic: 'Sicurezza' },
];

const SENTIMENT_POSITIVE = /crescita|aumento|miglior|positiv|successo|record|ripresa|accordo|pace/i;
const SENTIMENT_NEGATIVE = /crisi|calo|peggior|negativ|crollo|morti|emergenza|allarme|rischio|danno/i;

export async function POST(request: Request) {
  try {
    const { items } = (await request.json()) as { items: NewsItem[] };

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const result: AnalysisResult = {
      breakingItems: [],
      suggestedModules: [],
      trendingTopics: [],
      summary: '',
    };

    const moduleSuggestions = new Set<string>();
    const topicCounts = new Map<string, { count: number; sentiment: 'positive' | 'negative' | 'neutral' }>();

    for (const item of items) {
      const text = `${item.title} ${item.description}`;
      let maxUrgency = 0;

      for (const p of URGENCY_PATTERNS) {
        if (p.pattern.test(text)) {
          maxUrgency = Math.max(maxUrgency, p.weight);
          p.modules.forEach((m) => moduleSuggestions.add(m));

          const existing = topicCounts.get(p.topic);
          const sentiment = SENTIMENT_POSITIVE.test(text) ? 'positive' as const :
            SENTIMENT_NEGATIVE.test(text) ? 'negative' as const : 'neutral' as const;

          if (existing) {
            existing.count++;
          } else {
            topicCounts.set(p.topic, { count: 1, sentiment });
          }
        }
      }

      // Time-based urgency boost (very recent = more urgent)
      const ageMinutes = (Date.now() - new Date(item.publishedAt).getTime()) / 60000;
      if (ageMinutes < 30) maxUrgency *= 1.2;
      if (ageMinutes < 10) maxUrgency *= 1.3;

      if (maxUrgency > 0.6) {
        result.breakingItems.push({
          id: item.id,
          reason: getUrgencyReason(text),
          urgency: Math.min(1, maxUrgency),
        });
      }
    }

    result.suggestedModules = Array.from(moduleSuggestions).slice(0, 5);

    result.trendingTopics = Array.from(topicCounts.entries())
      .map(([topic, data]) => ({ topic, count: data.count, sentiment: data.sentiment }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // Generate summary
    const topTopics = result.trendingTopics.slice(0, 3).map((t) => t.topic);
    const breakingCount = result.breakingItems.length;

    if (breakingCount > 0) {
      result.summary = `${breakingCount} notizie ad alta priorità rilevate. Temi dominanti: ${topTopics.join(', ') || 'vari'}. Consigliata attenzione sui moduli: ${result.suggestedModules.join(', ')}.`;
    } else if (topTopics.length > 0) {
      result.summary = `Situazione monitorata. Temi principali: ${topTopics.join(', ')}. Nessuna emergenza rilevata.`;
    } else {
      result.summary = 'Nessun tema critico rilevato. Situazione stabile.';
    }

    return NextResponse.json(result);
  } catch (e) {
    console.error('AI Analysis error:', e);
    return NextResponse.json({
      breakingItems: [],
      suggestedModules: [],
      trendingTopics: [],
      summary: 'Analisi non disponibile.',
    });
  }
}

function getUrgencyReason(text: string): string {
  if (/terremot|sismi/i.test(text)) return 'Evento sismico rilevato';
  if (/alluvion|inondazion/i.test(text)) return 'Alluvione/Inondazione segnalata';
  if (/terroris|attentato/i.test(text)) return 'Evento di sicurezza critico';
  if (/borsa.*crollo|crash/i.test(text)) return 'Crollo dei mercati finanziari';
  if (/cyber|hacker/i.test(text)) return 'Attacco informatico segnalato';
  if (/guerra|conflitto/i.test(text)) return 'Escalation conflitto';
  if (/tempest|uragano/i.test(text)) return 'Evento meteorologico estremo';
  if (/incendio|rogo/i.test(text)) return 'Incendio di vaste proporzioni';
  return 'Notizia ad alta priorità';
}
