export type BossStatus = "pending" | "slain" | "died"

export type Game = {
  id: string
  name: string
  short: string
  color: string
}

export type HistoryEvent = {
  id: string
  kind: "slain" | "died"
  label: string
}

export type Boss = {
  id: string
  name: string
  gameId: string
  status: BossStatus
  deaths: number
  history: HistoryEvent[]
}

export const GAMES: Game[] = [
  { id: "elden-ring", name: "ELDEN RING", short: "ELDEN RING", color: "#C9A24B" },
  { id: "sekiro", name: "SEKIRO", short: "SEKIRO", color: "#9C4A3C" },
  { id: "lies-of-p", name: "LIES OF P", short: "LIES OF P", color: "#5C7C9E" },
  { id: "dark-souls", name: "DARK SOULS", short: "DARK SOULS", color: "#8A7A5F" },
  { id: "bloodborne", name: "BLOODBORNE", short: "BLOODBORNE", color: "#7A3340" },
  { id: "other", name: "DİĞER", short: "DİĞER", color: "#5A5040" },
]

export function gameById(id: string): Game {
  const found = GAMES.find((g) => g.id === id);
  if (found) return found;
  
  return {
    id: id,
    name: id,
    short: id,
    color: "#5A5040" // Diğer seçeneğiyle aynı standart gri/kahve renk
  };
}

let seq = 100
export function nextId(prefix = "b"): string {
  seq += 1
  return `${prefix}-${seq}`
}

export const SEED_BOSSES: Boss[] = [
  {
    id: "b-1",
    name: "MARGIT, MÜŞUM ALAMET",
    gameId: "elden-ring",
    status: "slain",
    deaths: 11,
    history: [
      { id: "h-1", kind: "died", label: "İlk karşılaşma" },
      { id: "h-2", kind: "died", label: "İkinci faz denemesi" },
      { id: "h-3", kind: "slain", label: "Nihayet kesildi" },
    ],
  },
  {
    id: "b-2",
    name: "MALENIA, MIQUELLA'NIN KILICI",
    gameId: "elden-ring",
    status: "died",
    deaths: 47,
    history: [
      { id: "h-4", kind: "died", label: "Su kuşu dansı" },
      { id: "h-5", kind: "died", label: "İkinci faz — Çürüme" },
    ],
  },
  {
    id: "b-3",
    name: "GODRICK, AŞILANMIŞ",
    gameId: "elden-ring",
    status: "pending",
    deaths: 3,
    history: [{ id: "h-6", kind: "died", label: "Ejderha kolu" }],
  },
  {
    id: "b-4",
    name: "GENICHIRO ASHINA",
    gameId: "sekiro",
    status: "slain",
    deaths: 19,
    history: [
      { id: "h-7", kind: "died", label: "Şimşek darbesi" },
      { id: "h-8", kind: "slain", label: "Poise kırıldı" },
    ],
  },
  {
    id: "b-5",
    name: "ISSHIN, KILIÇ AZİZİ",
    gameId: "sekiro",
    status: "died",
    deaths: 62,
    history: [
      { id: "h-9", kind: "died", label: "Üçüncü faz — mızrak" },
      { id: "h-10", kind: "died", label: "Alevli namlu" },
    ],
  },
  {
    id: "b-6",
    name: "ADSIZ KUKLA",
    gameId: "lies-of-p",
    status: "pending",
    deaths: 0,
    history: [],
  },
  {
    id: "b-7",
    name: "KRALIN ALEVİ FUOCO",
    gameId: "lies-of-p",
    status: "slain",
    deaths: 8,
    history: [{ id: "h-11", kind: "slain", label: "Perfect guard zinciri" }],
  },
  {
    id: "b-8",
    name: "ORNSTEIN & SMOUGH",
    gameId: "dark-souls",
    status: "died",
    deaths: 24,
    history: [{ id: "h-12", kind: "died", label: "İki mızrak birden" }],
  },
  {
    id: "b-9",
    name: "LADY MARIA",
    gameId: "bloodborne",
    status: "slain",
    deaths: 14,
    history: [{ id: "h-13", kind: "slain", label: "Kan ateşi kesildi" }],
  },
]
