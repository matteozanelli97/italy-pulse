import type { DatiMercato, TickerItem } from "@/types";

// Dati di mercato mock realistici
const mercatiMock: DatiMercato = {
  ftseMib: 34285.50,
  ftseMibVariazione: 0.42,
  spreadBtp: 138,
  spreadVariazione: -2,
  prezzoBenzina: 1.849,
  prezzoOro: 2935.20,
  oroVariazione: 0.15,
  aggiornamento: new Date().toISOString(),
};

export function fetchMercati(): DatiMercato {
  return { ...mercatiMock };
}

export function getMercatiTicker(): TickerItem[] {
  return [
    {
      label: "FTSE MIB",
      valore: `${mercatiMock.ftseMib.toLocaleString("it-IT")} (${mercatiMock.ftseMibVariazione > 0 ? "+" : ""}${mercatiMock.ftseMibVariazione}%)`,
      trend: mercatiMock.ftseMibVariazione > 0 ? "up" : mercatiMock.ftseMibVariazione < 0 ? "down" : "stable",
    },
    {
      label: "Spread BTP",
      valore: `${mercatiMock.spreadBtp} bps (${mercatiMock.spreadVariazione > 0 ? "+" : ""}${mercatiMock.spreadVariazione})`,
      trend: mercatiMock.spreadVariazione > 0 ? "up" : mercatiMock.spreadVariazione < 0 ? "down" : "stable",
    },
    {
      label: "Benzina",
      valore: `€${mercatiMock.prezzoBenzina.toFixed(3)}/L`,
      trend: "stable",
    },
    {
      label: "Oro",
      valore: `$${mercatiMock.prezzoOro.toLocaleString("it-IT")} (${mercatiMock.oroVariazione > 0 ? "+" : ""}${mercatiMock.oroVariazione}%)`,
      trend: mercatiMock.oroVariazione > 0 ? "up" : mercatiMock.oroVariazione < 0 ? "down" : "stable",
    },
  ];
}
