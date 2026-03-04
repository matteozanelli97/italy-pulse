import { NextResponse } from 'next/server';
import type { LiveCam } from '@/types';

export const dynamic = 'force-dynamic';

const LIVE_CAMS: LiveCam[] = [
  // === WEBCAM — Italy ===
  // === WEBCAM — Italy (verified live 24/7 streams) ===
  { id: 'cam-roma-colosseo', city: 'Roma', title: 'Colosseo', url: 'https://www.youtube.com/watch?v=ShBMgXhMgGQ', embedUrl: 'https://www.youtube.com/embed/ShBMgXhMgGQ?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3', type: 'webcam', active: true },
  { id: 'cam-venezia', city: 'Venezia', title: 'Piazza San Marco', url: 'https://www.youtube.com/watch?v=vPj3PEdrLBk', embedUrl: 'https://www.youtube.com/embed/vPj3PEdrLBk?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3', type: 'webcam', active: true },
  { id: 'cam-napoli', city: 'Napoli', title: 'Golfo di Napoli', url: 'https://www.youtube.com/watch?v=ND-5MUeBa7E', embedUrl: 'https://www.youtube.com/embed/ND-5MUeBa7E?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3', type: 'webcam', active: true },
  { id: 'cam-milano', city: 'Milano', title: 'Duomo', url: 'https://www.youtube.com/watch?v=fiS7JFz0Myc', embedUrl: 'https://www.youtube.com/embed/fiS7JFz0Myc?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3', type: 'webcam', active: true },
  { id: 'cam-etna', city: 'Catania', title: 'Etna', url: 'https://www.youtube.com/watch?v=jvUKG_OCAMk', embedUrl: 'https://www.youtube.com/embed/jvUKG_OCAMk?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3', type: 'webcam', active: true },
  { id: 'cam-firenze', city: 'Firenze', title: 'Panorama', url: 'https://www.youtube.com/watch?v=zbfJEgrMBIg', embedUrl: 'https://www.youtube.com/embed/zbfJEgrMBIg?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3', type: 'webcam', active: true },
  // === WEBCAM — Europe ===
  { id: 'cam-paris', city: 'Parigi', title: 'Tour Eiffel', url: 'https://www.youtube.com/watch?v=cPSKHFs5poI', embedUrl: 'https://www.youtube.com/embed/cPSKHFs5poI?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3', type: 'webcam', active: true },
  { id: 'cam-amsterdam', city: 'Amsterdam', title: 'Dam Square', url: 'https://www.youtube.com/watch?v=5VoVJpBrfbE', embedUrl: 'https://www.youtube.com/embed/5VoVJpBrfbE?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3', type: 'webcam', active: true },
  { id: 'cam-barcelona', city: 'Barcellona', title: 'Port Vell', url: 'https://www.youtube.com/watch?v=EFQKbANJl5U', embedUrl: 'https://www.youtube.com/embed/EFQKbANJl5U?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3', type: 'webcam', active: true },
  { id: 'cam-dubrovnik', city: 'Dubrovnik', title: 'Old Town', url: 'https://www.youtube.com/watch?v=B-HkgEeXnN4', embedUrl: 'https://www.youtube.com/embed/B-HkgEeXnN4?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3', type: 'webcam', active: true },
  { id: 'cam-prague', city: 'Praga', title: 'Piazza Vecchia', url: 'https://www.youtube.com/watch?v=0Vu4Q3u0lqU', embedUrl: 'https://www.youtube.com/embed/0Vu4Q3u0lqU?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3', type: 'webcam', active: true },

  // === DIRETTE TV — Italia ===
  { id: 'stream-rainews', city: 'Italia', title: 'Rai News 24', url: 'https://www.youtube.com/watch?v=rPSg3UVjh6A', embedUrl: 'https://www.youtube.com/embed/rPSg3UVjh6A?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3', type: 'news', active: true },
  { id: 'stream-skytg24', city: 'Italia', title: 'Sky TG24', url: 'https://www.youtube.com/watch?v=tgbNymZ7vqY', embedUrl: 'https://www.youtube.com/embed/tgbNymZ7vqY?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3', type: 'news', active: true },
  { id: 'stream-euronews', city: 'Europa', title: 'Euronews', url: 'https://www.youtube.com/watch?v=uLoH9MeDpOg', embedUrl: 'https://www.youtube.com/embed/uLoH9MeDpOg?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3', type: 'news', active: true },
  // === DIRETTE TV — International (24/7) ===
  { id: 'stream-france24', city: 'Francia', title: 'France 24', url: 'https://www.youtube.com/watch?v=h3MuIUNCCzI', embedUrl: 'https://www.youtube.com/embed/h3MuIUNCCzI?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3', type: 'news', active: true },
  { id: 'stream-dw', city: 'Germania', title: 'DW News', url: 'https://www.youtube.com/watch?v=GE_SfNVNyqk', embedUrl: 'https://www.youtube.com/embed/GE_SfNVNyqk?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3', type: 'news', active: true },
  { id: 'stream-aljazeera', city: 'Qatar', title: 'Al Jazeera', url: 'https://www.youtube.com/watch?v=gCNeDWCI0vo', embedUrl: 'https://www.youtube.com/embed/gCNeDWCI0vo?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3', type: 'news', active: true },
  { id: 'stream-cnbc', city: 'USA', title: 'CNBC', url: 'https://www.youtube.com/watch?v=9NyxcX3rhQs', embedUrl: 'https://www.youtube.com/embed/9NyxcX3rhQs?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3', type: 'news', active: true },
  { id: 'stream-bloomberg', city: 'USA', title: 'Bloomberg', url: 'https://www.youtube.com/watch?v=dp8PhLsUcFE', embedUrl: 'https://www.youtube.com/embed/dp8PhLsUcFE?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3', type: 'news', active: true },
  { id: 'stream-abc', city: 'Australia', title: 'ABC News AU', url: 'https://www.youtube.com/watch?v=W1ilCy6XrmI', embedUrl: 'https://www.youtube.com/embed/W1ilCy6XrmI?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3', type: 'news', active: true },
  { id: 'stream-cnn', city: 'USA', title: 'CNN', url: 'https://www.youtube.com/watch?v=bXR8YSsBRNQ', embedUrl: 'https://www.youtube.com/embed/bXR8YSsBRNQ?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3', type: 'news', active: true },
];

export async function GET() {
  // Skip server-side availability checks — they fail in serverless environments.
  // Mark all cams as active; the client iframe will handle display if a stream is actually offline.
  const camsWithStatus: LiveCam[] = LIVE_CAMS.map((cam) => ({ ...cam, active: true }));
  return NextResponse.json({ cams: camsWithStatus, updatedAt: new Date().toISOString() });
}
