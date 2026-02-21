import { NextResponse } from "next/server";
import { fetchMercati } from "@/lib/fetchers/mercati";
import type { MercatiResponse } from "@/types";

export async function GET() {
  const dati = fetchMercati();

  const response: MercatiResponse = {
    dati,
  };

  return NextResponse.json(response);
}
