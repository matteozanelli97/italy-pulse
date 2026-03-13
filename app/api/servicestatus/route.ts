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
  // Telecom
  { id: 'att', name: 'AT&T', category: 'telecom', url: 'https://www.att.com', icon: 'AT' },
  { id: 'verizon', name: 'Verizon', category: 'telecom', url: 'https://www.verizon.com', icon: 'VZ' },
  { id: 'vodafone', name: 'Vodafone', category: 'telecom', url: 'https://www.vodafone.com', icon: 'V' },
  { id: 'tmobile', name: 'T-Mobile', category: 'telecom', url: 'https://www.t-mobile.com', icon: 'TM' },
  // Banking
  { id: 'chase', name: 'Chase', category: 'banking', url: 'https://www.chase.com', icon: 'CH' },
  { id: 'hsbc', name: 'HSBC', category: 'banking', url: 'https://www.hsbc.com', icon: 'HS' },
  { id: 'paypal', name: 'PayPal', category: 'banking', url: 'https://www.paypal.com', icon: 'PP' },
  { id: 'stripe', name: 'Stripe', category: 'banking', url: 'https://www.stripe.com', icon: 'ST' },
  // Social
  { id: 'whatsapp', name: 'WhatsApp', category: 'social', url: 'https://web.whatsapp.com', icon: 'WA' },
  { id: 'instagram', name: 'Instagram', category: 'social', url: 'https://www.instagram.com', icon: 'IG' },
  { id: 'facebook', name: 'Facebook', category: 'social', url: 'https://www.facebook.com', icon: 'FB' },
  { id: 'tiktok', name: 'TikTok', category: 'social', url: 'https://www.tiktok.com', icon: 'TT' },
  { id: 'x', name: 'X (Twitter)', category: 'social', url: 'https://www.x.com', icon: 'X' },
  // Cloud & Tech
  { id: 'google', name: 'Google', category: 'cloud', url: 'https://www.google.com', icon: 'G' },
  { id: 'aws', name: 'AWS', category: 'cloud', url: 'https://health.aws.amazon.com', icon: 'AW' },
  { id: 'azure', name: 'Microsoft Azure', category: 'cloud', url: 'https://azure.microsoft.com', icon: 'AZ' },
  { id: 'cloudflare', name: 'Cloudflare', category: 'cloud', url: 'https://www.cloudflare.com', icon: 'CF' },
  // Transport
  { id: 'uber', name: 'Uber', category: 'transport', url: 'https://www.uber.com', icon: 'UB' },
  { id: 'flightradar', name: 'FlightRadar24', category: 'transport', url: 'https://www.flightradar24.com', icon: 'FR' },
  // Media
  { id: 'netflix', name: 'Netflix', category: 'media', url: 'https://www.netflix.com', icon: 'NF' },
  { id: 'youtube', name: 'YouTube', category: 'media', url: 'https://www.youtube.com', icon: 'YT' },
  { id: 'spotify', name: 'Spotify', category: 'media', url: 'https://www.spotify.com', icon: 'SP' },
  { id: 'prime', name: 'Prime Video', category: 'media', url: 'https://www.primevideo.com', icon: 'PV' },
  // Gov
  { id: 'usagov', name: 'USA.gov', category: 'gov', url: 'https://www.usa.gov', icon: 'US' },
  { id: 'govuk', name: 'GOV.UK', category: 'gov', url: 'https://www.gov.uk', icon: 'UK' },
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
          headers: { 'User-Agent': 'Pulse/1.0 StatusCheck' },
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
