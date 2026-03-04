import { NextResponse } from 'next/server';
import type { LiveCam } from '@/types';

export const dynamic = 'force-dynamic';

const LIVE_CAMS: LiveCam[] = [
  // === WEBCAM — Italy ===
  { id: 'cam-roma-colosseo', city: 'Roma', title: 'Colosseo', url: 'https://www.youtube.com/watch?v=ShBMgXhMgGQ', embedUrl: 'https://www.youtube.com/embed/ShBMgXhMgGQ?autoplay=1&mute=1', type: 'webcam', active: true },
  { id: 'cam-venezia', city: 'Venezia', title: 'Piazza San Marco', url: 'https://www.youtube.com/watch?v=vPj3PEdrLBk', embedUrl: 'https://www.youtube.com/embed/vPj3PEdrLBk?autoplay=1&mute=1', type: 'webcam', active: true },
  { id: 'cam-napoli', city: 'Napoli', title: 'Vesuvio', url: 'https://www.youtube.com/watch?v=ND-5MUeBa7E', embedUrl: 'https://www.youtube.com/embed/ND-5MUeBa7E?autoplay=1&mute=1', type: 'webcam', active: true },
  { id: 'cam-milano', city: 'Milano', title: 'Duomo', url: 'https://www.youtube.com/watch?v=fiS7JFz0Myc', embedUrl: 'https://www.youtube.com/embed/fiS7JFz0Myc?autoplay=1&mute=1', type: 'webcam', active: true },
  { id: 'cam-etna', city: 'Catania', title: 'Etna', url: 'https://www.youtube.com/watch?v=jvUKG_OCAMk', embedUrl: 'https://www.youtube.com/embed/jvUKG_OCAMk?autoplay=1&mute=1', type: 'webcam', active: true },
  // === WEBCAM — Europe ===
  { id: 'cam-paris', city: 'Parigi', title: 'Tour Eiffel', url: 'https://www.youtube.com/watch?v=cPSKHFs5poI', embedUrl: 'https://www.youtube.com/embed/cPSKHFs5poI?autoplay=1&mute=1', type: 'webcam', active: true },
  { id: 'cam-amsterdam', city: 'Amsterdam', title: 'Dam Square', url: 'https://www.youtube.com/watch?v=5VoVJpBrfbE', embedUrl: 'https://www.youtube.com/embed/5VoVJpBrfbE?autoplay=1&mute=1', type: 'webcam', active: true },
  { id: 'cam-barcelona', city: 'Barcellona', title: 'Port Vell', url: 'https://www.youtube.com/watch?v=EFQKbANJl5U', embedUrl: 'https://www.youtube.com/embed/EFQKbANJl5U?autoplay=1&mute=1', type: 'webcam', active: true },
  { id: 'cam-dubrovnik', city: 'Dubrovnik', title: 'Old Town', url: 'https://www.youtube.com/watch?v=B-HkgEeXnN4', embedUrl: 'https://www.youtube.com/embed/B-HkgEeXnN4?autoplay=1&mute=1', type: 'webcam', active: true },
  { id: 'cam-prague', city: 'Praga', title: 'Piazza Vecchia', url: 'https://www.youtube.com/watch?v=0Vu4Q3u0lqU', embedUrl: 'https://www.youtube.com/embed/0Vu4Q3u0lqU?autoplay=1&mute=1', type: 'webcam', active: true },

  // === DIRETTE TV — Italia ===
  { id: 'stream-rainews', city: 'Italia', title: 'Rai News 24', url: 'https://www.youtube.com/watch?v=rPSg3UVjh6A', embedUrl: 'https://www.youtube.com/embed/rPSg3UVjh6A?autoplay=1&mute=1', type: 'news', active: true },
  { id: 'stream-skytg24', city: 'Italia', title: 'Sky TG24', url: 'https://www.youtube.com/watch?v=tgbNymZ7vqY', embedUrl: 'https://www.youtube.com/embed/tgbNymZ7vqY?autoplay=1&mute=1', type: 'news', active: true },
  { id: 'stream-euronews', city: 'Europa', title: 'Euronews', url: 'https://www.youtube.com/watch?v=uLoH9MeDpOg', embedUrl: 'https://www.youtube.com/embed/uLoH9MeDpOg?autoplay=1&mute=1', type: 'news', active: true },
  // === DIRETTE TV — International (24/7) ===
  { id: 'stream-france24', city: 'Francia', title: 'France 24', url: 'https://www.youtube.com/watch?v=h3MuIUNCCzI', embedUrl: 'https://www.youtube.com/embed/h3MuIUNCCzI?autoplay=1&mute=1', type: 'news', active: true },
  { id: 'stream-dw', city: 'Germania', title: 'DW News', url: 'https://www.youtube.com/watch?v=GE_SfNVNyqk', embedUrl: 'https://www.youtube.com/embed/GE_SfNVNyqk?autoplay=1&mute=1', type: 'news', active: true },
  { id: 'stream-aljazeera', city: 'Qatar', title: 'Al Jazeera', url: 'https://www.youtube.com/watch?v=gCNeDWCI0vo', embedUrl: 'https://www.youtube.com/embed/gCNeDWCI0vo?autoplay=1&mute=1', type: 'news', active: true },
  { id: 'stream-cnbc', city: 'USA', title: 'CNBC', url: 'https://www.youtube.com/watch?v=9NyxcX3rhQs', embedUrl: 'https://www.youtube.com/embed/9NyxcX3rhQs?autoplay=1&mute=1', type: 'news', active: true },
  { id: 'stream-bloomberg', city: 'USA', title: 'Bloomberg', url: 'https://www.youtube.com/watch?v=dp8PhLsUcFE', embedUrl: 'https://www.youtube.com/embed/dp8PhLsUcFE?autoplay=1&mute=1', type: 'news', active: true },
  { id: 'stream-abc', city: 'Australia', title: 'ABC News AU', url: 'https://www.youtube.com/watch?v=W1ilCy6XrmI', embedUrl: 'https://www.youtube.com/embed/W1ilCy6XrmI?autoplay=1&mute=1', type: 'news', active: true },
];

export async function GET() {
  // Check via YouTube thumbnail (fast, reliable, never blocked)
  const camsWithStatus: LiveCam[] = await Promise.all(
    LIVE_CAMS.map(async (cam) => {
      const videoId = cam.embedUrl?.match(/embed\/([^?]+)/)?.[1];
      if (!videoId) return { ...cam, active: false };
      try {
        const c = new AbortController();
        const t = setTimeout(() => c.abort(), 3000);
        const res = await fetch(`https://img.youtube.com/vi/${videoId}/default.jpg`, { method: 'HEAD', signal: c.signal });
        clearTimeout(t);
        return { ...cam, active: res.ok };
      } catch {
        return { ...cam, active: true }; // assume active on timeout
      }
    })
  );
  return NextResponse.json({ cams: camsWithStatus, updatedAt: new Date().toISOString() });
}
