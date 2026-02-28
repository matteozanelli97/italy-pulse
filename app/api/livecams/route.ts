import { NextResponse } from 'next/server';
import type { LiveCam } from '@/types';

export const dynamic = 'force-dynamic';

const LIVE_CAMS: LiveCam[] = [
  // YouTube live embeds — these actually work in iframes
  { id: 'cam-roma-colosseo', city: 'Roma', title: 'Colosseo Live', url: 'https://www.skylinewebcams.com/en/webcam/italia/lazio/roma/colosseo.html', embedUrl: 'https://www.youtube.com/embed/ShBMgXhMgGQ?autoplay=1&mute=1', type: 'webcam', active: true },
  { id: 'cam-roma-pantheon', city: 'Roma', title: 'Pantheon', url: 'https://www.skylinewebcams.com/en/webcam/italia/lazio/roma/pantheon.html', embedUrl: 'https://www.youtube.com/embed/R3GYP1IyGhA?autoplay=1&mute=1', type: 'webcam', active: true },
  { id: 'cam-venezia', city: 'Venezia', title: 'Piazza San Marco', url: 'https://www.skylinewebcams.com/en/webcam/italia/veneto/venezia/piazza-san-marco.html', embedUrl: 'https://www.youtube.com/embed/vPj3PEdrLBk?autoplay=1&mute=1', type: 'webcam', active: true },
  { id: 'cam-venezia-rialto', city: 'Venezia', title: 'Ponte di Rialto', url: 'https://www.skylinewebcams.com/en/webcam/italia/veneto/venezia/rialto.html', embedUrl: 'https://www.youtube.com/embed/KFJaFHxwOdw?autoplay=1&mute=1', type: 'webcam', active: true },
  { id: 'cam-napoli', city: 'Napoli', title: 'Vesuvio Panorama', url: 'https://www.skylinewebcams.com/en/webcam/italia/campania/napoli/napoli-vesuvio.html', embedUrl: 'https://www.youtube.com/embed/ND-5MUeBa7E?autoplay=1&mute=1', type: 'webcam', active: true },
  { id: 'cam-milano', city: 'Milano', title: 'Duomo di Milano', url: 'https://www.skylinewebcams.com/en/webcam/italia/lombardia/milano/duomo-milano.html', embedUrl: 'https://www.youtube.com/embed/fiS7JFz0Myc?autoplay=1&mute=1', type: 'webcam', active: true },
  { id: 'cam-firenze', city: 'Firenze', title: 'Ponte Vecchio', url: 'https://www.skylinewebcams.com/en/webcam/italia/toscana/firenze/ponte-vecchio.html', embedUrl: 'https://www.youtube.com/embed/0KPmq_ZfXzk?autoplay=1&mute=1', type: 'webcam', active: true },
  { id: 'cam-etna', city: 'Catania', title: 'Etna Vulcano', url: 'https://www.skylinewebcams.com/en/webcam/italia/sicilia/catania/etna.html', embedUrl: 'https://www.youtube.com/embed/jvUKG_OCAMk?autoplay=1&mute=1', type: 'webcam', active: true },

  // Live news streams — YouTube embeds that work in iframes
  { id: 'stream-rainews', city: 'Italia', title: 'Rai News 24', url: 'https://www.rainews.it/notiziari/rainews24', embedUrl: 'https://www.youtube.com/embed/rPSg3UVjh6A?autoplay=1&mute=1', type: 'news', active: true },
  { id: 'stream-skytg24', city: 'Italia', title: 'Sky TG24', url: 'https://video.sky.it/diretta/tg24', embedUrl: 'https://www.youtube.com/embed/tgbNymZ7vqY?autoplay=1&mute=1', type: 'news', active: true },
  { id: 'stream-euronews', city: 'Europa', title: 'Euronews IT', url: 'https://it.euronews.com/live', embedUrl: 'https://www.youtube.com/embed/uLoH9MeDpOg?autoplay=1&mute=1', type: 'news', active: true },

  // International news — CNBC, Bloomberg, France24
  { id: 'stream-cnbc', city: 'USA', title: 'CNBC Live', url: 'https://www.cnbc.com/live-tv/', embedUrl: 'https://www.youtube.com/embed/9NyxcX3rhQs?autoplay=1&mute=1', type: 'news', active: true },
  { id: 'stream-bloomberg', city: 'USA', title: 'Bloomberg TV', url: 'https://www.bloomberg.com/live', embedUrl: 'https://www.youtube.com/embed/dp8PhLsUcFE?autoplay=1&mute=1', type: 'news', active: true },
  { id: 'stream-france24', city: 'Francia', title: 'France 24', url: 'https://www.france24.com/en/live', embedUrl: 'https://www.youtube.com/embed/h3MuIUNCCzI?autoplay=1&mute=1', type: 'news', active: true },
  { id: 'stream-dw', city: 'Germania', title: 'DW News', url: 'https://www.dw.com/en/live-tv/s-100825', embedUrl: 'https://www.youtube.com/embed/GE_SfNVNyqk?autoplay=1&mute=1', type: 'news', active: true },
];

export async function GET() {
  // For YouTube embeds we can trust they're available; just mark all active
  const camsWithStatus: LiveCam[] = LIVE_CAMS.map((cam) => ({ ...cam, active: true }));
  return NextResponse.json({ cams: camsWithStatus, updatedAt: new Date().toISOString() });
}
