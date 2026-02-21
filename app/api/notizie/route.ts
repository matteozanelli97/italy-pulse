import { NextResponse } from "next/server";
import { fetchNotizie } from "@/lib/fetchers/notizie";
import type { NotizieResponse } from "@/types";

export async function GET() {
  const notizie = fetchNotizie();

  const response: NotizieResponse = {
    notizie,
    aggiornamento: new Date().toISOString(),
  };

  return NextResponse.json(response);
}
