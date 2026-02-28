import { NextResponse } from 'next/server';
import type { LiveCam } from '@/types';

export const dynamic = 'force-dynamic';

const LIVE_CAMS: LiveCam[] = [
  // Webcams — verified YouTube live embeds
  { id: 'cam-roma-colosseo', city: 'Roma', title: 'Colosseo Live', url: 'https://www.youtube.com/watch?v=ShBMgXhMgGQ', embedUrl: 'https://www.youtube.com/embed/ShBMgXhMgGQ?autoplay=1&mute=1', type: 'webcam' },
  { id: 'cam-roma-pantheon', city: 'Roma', title: 'Pantheon', url: 'https://www.youtube.com/watch?v=R3GYP1IyGhA', embedUrl: 'https://www.youtube.com/embed/R3GYP1IyGhA?autoplay=1&mute=1', type: 'webcam' },
  { id: 'cam-venezia', city: 'Venezia', title: 'Piazza San Marco', url: 'https://www.youtube.com/watch?v=vPj3PEdrLBk', embedUrl: 'https://www.youtube.com/embed/vPj3PEdrLBk?autoplay=1&mute=1', type: 'webcam' },
  { id: 'cam-venezia-rialto', city: 'Venezia', title: 'Ponte di Rialto', url: 'https://www.youtube.com/watch?v=KFJaFHxwOdw', embedUrl: 'https://www.youtube.com/embed/KFJaFHxwOdw?autoplay=1&mute=1', type: 'webcam' },
  { id: 'cam-napoli', city: 'Napoli', title: 'Vesuvio Panorama', url: 'https://www.youtube.com/watch?v=ND-5MUeBa7E', embedUrl: 'https://www.youtube.com/embed/ND-5MUeBa7E?autoplay=1&mute=1', type: 'webcam' },
  { id: 'cam-milano', city: 'Milano', title: 'Duomo di Milano', url: 'https://www.youtube.com/watch?v=fiS7JFz0Myc', embedUrl: 'https://www.youtube.com/embed/fiS7JFz0Myc?autoplay=1&mute=1', type: 'webcam' },
  { id: 'cam-firenze', city: 'Firenze', title: 'Ponte Vecchio', url: 'https://www.youtube.com/watch?v=0KPmq_ZfXzk', embedUrl: 'https://www.youtube.com/embed/0KPmq_ZfXzk?autoplay=1&mute=1', type: 'webcam' },
  { id: 'cam-etna', city: 'Catania', title: 'Etna Vulcano', url: 'https://www.youtube.com/watch?v=jvUKG_OCAMk', embedUrl: 'https://www.youtube.com/embed/jvUKG_OCAMk?autoplay=1&mute=1', type: 'webcam' },
  { id: 'cam-amalfi', city: 'Amalfi', title: 'Costiera Amalfitana', url: 'https://www.youtube.com/watch?v=BjVYBg6gv04', embedUrl: 'https://www.youtube.com/embed/BjVYBg6gv04?autoplay=1&mute=1', type: 'webcam' },
  { id: 'cam-taormina', city: 'Taormina', title: 'Taormina Bay', url: 'https://www.youtube.com/watch?v=pO-GM5hN1rM', embedUrl: 'https://www.youtube.com/embed/pO-GM5hN1rM?autoplay=1&mute=1', type: 'webcam' },

  // Italian TV news — YouTube live
  { id: 'stream-rainews', city: 'Italia', title: 'Rai News 24', url: 'https://www.youtube.com/watch?v=rPSg3UVjh6A', embedUrl: 'https://www.youtube.com/embed/rPSg3UVjh6A?autoplay=1&mute=1', type: 'news' },
  { id: 'stream-skytg24', city: 'Italia', title: 'Sky TG24', url: 'https://www.youtube.com/watch?v=tgbNymZ7vqY', embedUrl: 'https://www.youtube.com/embed/tgbNymZ7vqY?autoplay=1&mute=1', type: 'news' },
  { id: 'stream-euronews', city: 'Europa', title: 'Euronews IT', url: 'https://www.youtube.com/watch?v=uLoH9MeDpOg', embedUrl: 'https://www.youtube.com/embed/uLoH9MeDpOg?autoplay=1&mute=1', type: 'news' },

  // International news — YouTube live
  { id: 'stream-cnbc', city: 'USA', title: 'CNBC', url: 'https://www.youtube.com/watch?v=9NyxcX3rhQs', embedUrl: 'https://www.youtube.com/embed/9NyxcX3rhQs?autoplay=1&mute=1', type: 'news' },
  { id: 'stream-bloomberg', city: 'USA', title: 'Bloomberg TV', url: 'https://www.youtube.com/watch?v=dp8PhLsUcFE', embedUrl: 'https://www.youtube.com/embed/dp8PhLsUcFE?autoplay=1&mute=1', type: 'news' },
  { id: 'stream-france24', city: 'Francia', title: 'France 24', url: 'https://www.youtube.com/watch?v=h3MuIUNCCzI', embedUrl: 'https://www.youtube.com/embed/h3MuIUNCCzI?autoplay=1&mute=1', type: 'news' },
  { id: 'stream-dw', city: 'Germania', title: 'DW News', url: 'https://www.youtube.com/watch?v=GE_SfNVNyqk', embedUrl: 'https://www.youtube.com/embed/GE_SfNVNyqk?autoplay=1&mute=1', type: 'news' },
  { id: 'stream-aljazeera', city: 'Qatar', title: 'Al Jazeera EN', url: 'https://www.youtube.com/watch?v=gCNeDWCI0vo', embedUrl: 'https://www.youtube.com/embed/gCNeDWCI0vo?autoplay=1&mute=1', type: 'news' },
];

async function checkYouTubeAvailable(videoId: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}

export async function GET() {
  const camsWithStatus: LiveCam[] = await Promise.all(
    LIVE_CAMS.map(async (cam) => {
      const videoId = cam.embedUrl?.match(/embed\/([^?]+)/)?.[1];
      if (!videoId) return { ...cam, active: false };
      const active = await checkYouTubeAvailable(videoId);
      return { ...cam, active };
    })
  );
  return NextResponse.json({ cams: camsWithStatus, updatedAt: new Date().toISOString() });
}
