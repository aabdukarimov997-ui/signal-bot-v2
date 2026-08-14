import { NextResponse } from "next/server";

/* ────────────────────────────────────────────────────────────
   BTC Dominance (BTC.D) + Altcoin Season indeksi.
   Manba: CoinGecko (bepul API, server tomonda — CORS yo'q).
   - BTC.D: jami bozor kapitallashuvidagi BTC ulushi (global).
   - Altseason: 7 kun ichida top-altlardan nechtasi BTC'dan
     yaxshiroq o'sgan (%). >=75% → Altseason.
   5 daqiqalik kesh + CoinGecko ishlamasa oxirgi/standart qiymatlar.
   ──────────────────────────────────────────────────────────── */

interface CoinItem {
  symbol: string;
  price_change_percentage_7d_in_currency?: number | null;
}

interface PulseData {
  btcDominance: number;
  ethDominance: number;
  altseasonIndex: number | null;
  btcChange7d: number | null;
  altOutperformers: number;
  totalAlts: number;
  btcDomLabel: string;
  altseasonLabel: string;
  altseasonEmoji: string;
  altseasonColor: string;
  updatedAt: string;
  source: "coingecko" | "fallback";
}

const STABLES = new Set([
  "USDT", "USDC", "DAI", "FDUSD", "TUSD", "BUSD", "PYUSD", "USDE",
  "USDS", "USD1", "GUSD", "USDP", "FRAX", "LUSD", "USDD", "MIM",
  "SUSD", "EURC", "EURI", "DAI", "USDB",
]);

const FALLBACK: PulseData = {
  btcDominance: 53.4,
  ethDominance: 11.2,
  altseasonIndex: 42,
  btcChange7d: 3.2,
  altOutperformers: 9,
  totalAlts: 20,
  btcDomLabel: "Muvozanat",
  altseasonLabel: "Aralash bozor",
  altseasonEmoji: "⚖️",
  altseasonColor: "#eab308",
  updatedAt: new Date().toISOString(),
  source: "fallback",
};

let cache: { data: PulseData; at: number } | null = null;
const TTL = 5 * 60 * 1000;

function btcDomLabel(d: number): string {
  if (d >= 65) return "BTC hukmron";
  if (d >= 58) return "BTC ustun";
  if (d >= 50) return "Muvozanat";
  if (d >= 40) return "Altlar yuqori";
  return "Altseason kuchli";
}

function altseasonMeta(idx: number) {
  if (idx >= 75) return { label: "Altseason", emoji: "🚀", color: "#22c55e" };
  if (idx >= 50) return { label: "Altseasonga yaqin", emoji: "🌤️", color: "#84cc16" };
  if (idx >= 25) return { label: "Aralash bozor", emoji: "⚖️", color: "#eab308" };
  return { label: "Bitcoin season", emoji: "💪", color: "#f7931a" };
}

async function fetchPulse(): Promise<PulseData> {
  const [globalRes, marketsRes] = await Promise.all([
    fetch("https://api.coingecko.com/api/v3/global", {
      signal: AbortSignal.timeout(8000),
      headers: { accept: "application/json" },
    }),
    fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=25&price_change_percentage=7d&sparkline=false",
      { signal: AbortSignal.timeout(8000), headers: { accept: "application/json" } }
    ),
  ]);
  if (!globalRes.ok || !marketsRes.ok) throw new Error("coingecko failed");

  const g = (await globalRes.json()) as {
    data?: { market_cap_percentage?: Record<string, number> };
  };
  const markets = (await marketsRes.json()) as CoinItem[];
  const mcp = g?.data?.market_cap_percentage;
  if (!mcp || !Array.isArray(markets)) throw new Error("bad payload");

  const btcDominance = mcp.btc ?? 50;
  const ethDominance = mcp.eth ?? 10;

  const btc = markets.find(
    (c) => c.symbol?.toLowerCase() === "btc"
  );
  const btcChange7d: number | null =
    typeof btc?.price_change_percentage_7d_in_currency === "number"
      ? btc.price_change_percentage_7d_in_currency
      : null;

  const alts = markets.filter((c) => {
    const sym = (c.symbol || "").toUpperCase();
    return (
      sym !== "BTC" &&
      !STABLES.has(sym) &&
      !sym.includes("USD") &&
      typeof c.price_change_percentage_7d_in_currency === "number"
    );
  });

  let altseasonIndex: number | null = null;
  let altOutperformers = 0;
  if (btcChange7d !== null && alts.length > 0) {
    altOutperformers = alts.filter(
      (c) => (c.price_change_percentage_7d_in_currency as number) > btcChange7d
    ).length;
    altseasonIndex = Math.round((altOutperformers / alts.length) * 100);
  }

  const meta =
    altseasonIndex === null
      ? altseasonMeta(50)
      : altseasonMeta(altseasonIndex);

  return {
    btcDominance,
    ethDominance,
    altseasonIndex,
    btcChange7d: btcChange7d === null ? null : Math.round(btcChange7d * 100) / 100,
    altOutperformers,
    totalAlts: alts.length,
    btcDomLabel: btcDomLabel(btcDominance),
    altseasonLabel: meta.label,
    altseasonEmoji: meta.emoji,
    altseasonColor: meta.color,
    updatedAt: new Date().toISOString(),
    source: "coingecko",
  };
}

export async function GET() {
  try {
    if (cache && Date.now() - cache.at < TTL) {
      return NextResponse.json(cache.data);
    }
    const data = await fetchPulse();
    cache = { data, at: Date.now() };
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch altseason data:", error);
    if (cache) return NextResponse.json(cache.data);
    return NextResponse.json(FALLBACK);
  }
}
