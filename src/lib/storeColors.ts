export interface StoreColor {
  bg: string;       // active background
  text: string;     // active text
  tailwindBg: string; // for Tailwind arbitrary value
}

const KNOWN: Record<string, StoreColor> = {
  lidl:          { bg: "#0050AA", text: "#ffffff", tailwindBg: "bg-[#0050AA]" },
  ah:            { bg: "#00A0E2", text: "#ffffff", tailwindBg: "bg-[#00A0E2]" },
  "albert heijn":{ bg: "#00A0E2", text: "#ffffff", tailwindBg: "bg-[#00A0E2]" },
  jumbo:         { bg: "#FFD600", text: "#1A1A1A", tailwindBg: "bg-[#FFD600]" },
  aldi:          { bg: "#1B3C87", text: "#ffffff", tailwindBg: "bg-[#1B3C87]" },
  plus:          { bg: "#E30613", text: "#ffffff", tailwindBg: "bg-[#E30613]" },
  dirk:          { bg: "#F04E37", text: "#ffffff", tailwindBg: "bg-[#F04E37]" },
  hoogvliet:     { bg: "#007A3D", text: "#ffffff", tailwindBg: "bg-[#007A3D]" },
  dekamarkt:     { bg: "#E4001B", text: "#ffffff", tailwindBg: "bg-[#E4001B]" },
  coop:          { bg: "#00843D", text: "#ffffff", tailwindBg: "bg-[#00843D]" },
  spar:          { bg: "#006400", text: "#ffffff", tailwindBg: "bg-[#006400]" },
  picnic:        { bg: "#5CB85C", text: "#ffffff", tailwindBg: "bg-[#5CB85C]" },
};

const FALLBACKS: StoreColor[] = [
  { bg: "#7C3AED", text: "#ffffff", tailwindBg: "bg-[#7C3AED]" },
  { bg: "#D97706", text: "#ffffff", tailwindBg: "bg-[#D97706]" },
  { bg: "#059669", text: "#ffffff", tailwindBg: "bg-[#059669]" },
  { bg: "#DB2777", text: "#ffffff", tailwindBg: "bg-[#DB2777]" },
  { bg: "#0891B2", text: "#ffffff", tailwindBg: "bg-[#0891B2]" },
  { bg: "#65A30D", text: "#ffffff", tailwindBg: "bg-[#65A30D]" },
];

// Stable hash → fallback colour index
function storeHash(name: string): number {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h % FALLBACKS.length;
}

export function getStoreColor(store: string): StoreColor {
  const key = store.toLowerCase().trim();
  return KNOWN[key] ?? FALLBACKS[storeHash(key)];
}

export function storeLabel(store: string): string {
  const labels: Record<string, string> = {
    ah: "Albert Heijn",
    lidl: "Lidl",
  };
  return labels[store.toLowerCase().trim()] ?? store;
}
