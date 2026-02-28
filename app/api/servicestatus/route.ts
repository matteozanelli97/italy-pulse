import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface ServiceCheck {
  id: string;
  name: string;
  category: 'telecom' | 'banking' | 'social' | 'cloud' | 'transport' | 'media' | 'gov';
  url: string;
  icon: string;
}

const SERVICES: ServiceCheck[] = [
  // Telecomunicazioni
  { id: 'tim', name: 'TIM', category: 'telecom', url: 'https://www.tim.it', icon: 'T' },
  { id: 'vodafone', name: 'Vodafone IT', category: 'telecom', url: 'https://www.vodafone.it', icon: 'V' },
  { id: 'wind3', name: 'WindTre', category: 'telecom', url: 'https://www.windtre.it', icon: 'W' },
  { id: 'iliad', name: 'Iliad', category: 'telecom', url: 'https://www.iliad.it', icon: 'I' },
  { id: 'fastweb', name: 'Fastweb', category: 'telecom', url: 'https://www.fastweb.it', icon: 'F' },
  // Banking
  { id: 'intesa', name: 'Intesa Sanpaolo', category: 'banking', url: 'https://www.intesasanpaolo.com', icon: 'IS' },
  { id: 'unicredit', name: 'UniCredit', category: 'banking', url: 'https://www.unicredit.it', icon: 'UC' },
  { id: 'poste', name: 'Poste Italiane', category: 'banking', url: 'https://www.poste.it', icon: 'PI' },
  { id: 'nexi', name: 'Nexi', category: 'banking', url: 'https://www.nexi.it', icon: 'NX' },
  // Social & Cloud
  { id: 'whatsapp', name: 'WhatsApp', category: 'social', url: 'https://web.whatsapp.com', icon: 'WA' },
  { id: 'instagram', name: 'Instagram', category: 'social', url: 'https://www.instagram.com', icon: 'IG' },
  { id: 'google', name: 'Google IT', category: 'cloud', url: 'https://www.google.it', icon: 'G' },
  { id: 'aws', name: 'AWS eu-south-1', category: 'cloud', url: 'https://health.aws.amazon.com', icon: 'AW' },
  // Transport
  { id: 'trenitalia', name: 'Trenitalia', category: 'transport', url: 'https://www.trenitalia.com', icon: 'TR' },
  { id: 'italo', name: 'Italo', category: 'transport', url: 'https://www.italotreno.it', icon: 'IT' },
  // Media
  { id: 'rai', name: 'RaiPlay', category: 'media', url: 'https://www.raiplay.it', icon: 'RA' },
  { id: 'sky', name: 'Sky Italia', category: 'media', url: 'https://www.sky.it', icon: 'SK' },
  // Gov
  { id: 'spid', name: 'SPID', category: 'gov', url: 'https://www.spid.gov.it', icon: 'SP' },
  { id: 'pagopa', name: 'PagoPA', category: 'gov', url: 'https://www.pagopa.it', icon: 'PA' },
  { id: 'anpr', name: 'ANPR', category: 'gov', url: 'https://www.anagrafenazionale.interno.it', icon: 'AN' },
];

export async function GET() {
  const results = await Promise.all(
    SERVICES.map(async (svc) => {
      const t0 = Date.now();
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const res = await fetch(svc.url, {
          method: 'HEAD',
          signal: controller.signal,
          redirect: 'follow',
          headers: { 'User-Agent': 'ItalyPulse/1.0 StatusCheck' },
        });
        clearTimeout(timeout);
        const latency = Date.now() - t0;
        const ok = res.ok || res.status === 405 || res.status === 403 || res.status === 302 || res.status === 301;
        return {
          id: svc.id,
          name: svc.name,
          category: svc.category,
          icon: svc.icon,
          status: ok ? (latency > 3000 ? 'degraded' : 'operational') : 'down',
          latency,
          httpStatus: res.status,
        };
      } catch {
        return {
          id: svc.id,
          name: svc.name,
          category: svc.category,
          icon: svc.icon,
          status: 'down' as const,
          latency: Date.now() - t0,
          httpStatus: 0,
        };
      }
    })
  );

  const operational = results.filter((r) => r.status === 'operational').length;
  const degraded = results.filter((r) => r.status === 'degraded').length;
  const down = results.filter((r) => r.status === 'down').length;

  return NextResponse.json({
    services: results,
    summary: { operational, degraded, down, total: results.length },
    updatedAt: new Date().toISOString(),
  });
}
