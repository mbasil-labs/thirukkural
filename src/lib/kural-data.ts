import raw from "@/data/thirukkural.json";

export type SectionId = "aram" | "porul" | "inbam";

export type Section = {
  id: SectionId;
  n: number;
  ta: string;
  tr: string;
  en: string;
  start: number;
  end: number;
};

export type Chapter = {
  n: number;
  section: SectionId;
  ta: string;
  tr: string;
  en: string;
  start: number;
  end: number;
};

export type Kural = {
  n: number;
  ta: [string, string];
  tr: [string, string];
  en: string;
};

type Book = {
  sections: Section[];
  chapters: Chapter[];
  kurals: Kural[];
};

export const book = raw as Book;

export const sections = book.sections;
export const chapters = book.chapters;
export const kurals = book.kurals;

export const TOTAL_KURALS = 1330;
export const DAILY_GOAL = 10;

export const SECTION_BY_ID: Record<SectionId, Section> = {
  aram: sections[0],
  porul: sections[1],
  inbam: sections[2],
};

const kuralByNumber: Kural[] = new Array(TOTAL_KURALS + 1);
for (const kural of kurals) kuralByNumber[kural.n] = kural;

const chapterByKural: Chapter[] = new Array(TOTAL_KURALS + 1);
for (const chapter of chapters) {
  for (let n = chapter.start; n <= chapter.end; n++) {
    chapterByKural[n] = chapter;
  }
}

export function isSectionId(value: string): value is SectionId {
  return value === "aram" || value === "porul" || value === "inbam";
}

export function getKural(n: number): Kural {
  const kural = kuralByNumber[n];
  if (!kural) throw new Error(`Unknown kural ${n}`);
  return kural;
}

export function getChapter(n: number): Chapter {
  const chapter = chapterByKural[n];
  if (!chapter) throw new Error(`Unknown chapter for kural ${n}`);
  return chapter;
}

export function getSection(n: number): Section {
  if (n <= 380) return SECTION_BY_ID.aram;
  if (n <= 1080) return SECTION_BY_ID.porul;
  return SECTION_BY_ID.inbam;
}

export function sectionIdForKural(n: number): SectionId {
  return getSection(n).id;
}

export function clampKural(n: number): number {
  return Math.min(TOTAL_KURALS, Math.max(1, Math.round(n)));
}

export function clampToSection(section: SectionId, n: number): number {
  const { start, end } = SECTION_BY_ID[section];
  return Math.min(end, Math.max(start, n));
}

export function splitEnglishLines(en: string): [string, string] | [string] {
  const trimmed = en.trim();
  const idx = trimmed.indexOf("; ");
  if (idx > 24 && idx < trimmed.length - 12) {
    return [trimmed.slice(0, idx + 1), trimmed.slice(idx + 2)];
  }
  return [trimmed];
}

export function todayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function yesterdayKey(date = new Date()): string {
  const y = new Date(date);
  y.setDate(y.getDate() - 1);
  return todayKey(y);
}

export function shortSectionName(section: Section): { ta: string; tr: string; en: string } {
  if (section.id === "aram") return { ta: "அறம்", tr: "Aram", en: "Virtue" };
  if (section.id === "porul") return { ta: "பொருள்", tr: "Porul", en: "Wealth" };
  return { ta: "இன்பம்", tr: "Inbam", en: "Love" };
}
