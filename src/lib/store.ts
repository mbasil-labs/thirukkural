import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  type SectionId,
  SECTION_BY_ID,
  clampKural,
  clampToSection,
  sectionIdForKural,
  todayKey,
  yesterdayKey,
} from "@/lib/kural-data";

export type PathState = {
  hydrated: boolean;
  section: SectionId;
  cursor: Record<SectionId, number>;
  seen: Record<number, true>;
  bookmarks: Record<number, true>;
  bookmarkFilter: boolean;
  streak: number;
  lastActiveDay: string | null;
  dailyCount: number;
  dailyDay: string | null;
  onboarded: boolean;
  scriptMode: "tamil" | "transliteration";
  setHydrated: (value: boolean) => void;
  setSection: (section: SectionId) => void;
  setScriptMode: (mode: "tamil" | "transliteration") => void;
  toggleScriptMode: () => void;
  toggleBookmark: (n: number) => void;
  isBookmarked: (n: number) => boolean;
  setBookmarkFilter: (value: boolean) => void;
  toggleBookmarkFilter: () => void;
  getSortedBookmarks: () => number[];
  goTo: (n: number) => void;
  next: () => void;
  prev: () => void;
  markSeen: (n: number) => void;
  completeOnboarding: () => void;
  seenCount: () => number;
  sectionSeenCount: (section: SectionId) => number;
  chapterSeenCount: (start: number, end: number) => number;
};

const START: Record<SectionId, number> = {
  aram: 1,
  porul: 381,
  inbam: 1081,
};

function countSeenInRange(seen: Record<number, true>, start: number, end: number) {
  let count = 0;
  for (let n = start; n <= end; n++) {
    if (seen[n]) count += 1;
  }
  return count;
}

export const usePathStore = create<PathState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      section: "aram",
      cursor: { ...START },
      seen: {},
      bookmarks: {},
      bookmarkFilter: false,
      streak: 0,
      lastActiveDay: null,
      dailyCount: 0,
      dailyDay: null,
      onboarded: false,
      scriptMode: "tamil",
      setHydrated: (value) => set({ hydrated: value }),
      setSection: (section) => {
        set({ section });
        get().markSeen(get().cursor[section]);
      },
      setScriptMode: (scriptMode) => set({ scriptMode }),
      toggleScriptMode: () =>
        set((state) => ({
          scriptMode: state.scriptMode === "tamil" ? "transliteration" : "tamil",
        })),
      toggleBookmark: (n) =>
        set((state) => {
          const next = { ...state.bookmarks };
          if (next[n]) {
            delete next[n];
          } else {
            next[n] = true;
          }
          return { bookmarks: next };
        }),
      isBookmarked: (n) => Boolean(get().bookmarks[n]),
      setBookmarkFilter: (bookmarkFilter) => set({ bookmarkFilter }),
      toggleBookmarkFilter: () =>
        set((state) => ({ bookmarkFilter: !state.bookmarkFilter })),
      getSortedBookmarks: () =>
        Object.keys(get().bookmarks)
          .map(Number)
          .sort((a, b) => a - b),
      goTo: (raw) => {
        const n = clampKural(raw);
        const section = sectionIdForKural(n);
        set((state) => ({
          section,
          cursor: { ...state.cursor, [section]: n },
        }));
        get().markSeen(n);
      },
      next: () => {
        const { section, cursor, bookmarkFilter } = get();
        const current = cursor[section];

        if (bookmarkFilter) {
          const bookmarks = get().getSortedBookmarks();
          const nextBookmark = bookmarks.find((n) => n > current);
          if (nextBookmark !== undefined) {
            get().goTo(nextBookmark);
            return;
          }
        }

        const n = clampToSection(section, current + 1);
        set((state) => ({ cursor: { ...state.cursor, [section]: n } }));
        get().markSeen(n);
      },
      prev: () => {
        const { section, cursor, bookmarkFilter } = get();
        const current = cursor[section];

        if (bookmarkFilter) {
          const bookmarks = get().getSortedBookmarks();
          const prevBookmark = [...bookmarks].reverse().find((n) => n < current);
          if (prevBookmark !== undefined) {
            get().goTo(prevBookmark);
            return;
          }
        }

        const n = clampToSection(section, current - 1);
        set((state) => ({ cursor: { ...state.cursor, [section]: n } }));
        get().markSeen(n);
      },
      markSeen: (n) => {
        const today = todayKey();
        const yesterday = yesterdayKey();
        set((state) => {
          const already = Boolean(state.seen[n]);
          const seen = already ? state.seen : { ...state.seen, [n]: true as const };
          let { streak, lastActiveDay, dailyCount, dailyDay } = state;

          if (lastActiveDay === today) {
            if (!already && dailyDay === today) dailyCount += 1;
            else if (dailyDay !== today) {
              dailyDay = today;
              dailyCount = already ? 0 : 1;
            }
          } else if (lastActiveDay === yesterday) {
            streak = (streak || 0) + 1;
            lastActiveDay = today;
            dailyDay = today;
            dailyCount = already ? 0 : 1;
          } else {
            streak = 1;
            lastActiveDay = today;
            dailyDay = today;
            dailyCount = already ? 0 : 1;
          }

          if (dailyCount > 99) dailyCount = 99;

          return { seen, streak, lastActiveDay, dailyCount, dailyDay };
        });
      },
      completeOnboarding: () => {
        set({ onboarded: true });
        get().markSeen(get().cursor[get().section]);
      },
      seenCount: () => Object.keys(get().seen).length,
      sectionSeenCount: (section) => {
        const { start, end } = SECTION_BY_ID[section];
        return countSeenInRange(get().seen, start, end);
      },
      chapterSeenCount: (start, end) => countSeenInRange(get().seen, start, end),
    }),
    {
      name: "thirukkural-path-v1",
      skipHydration: true,
      partialize: (state) => ({
        section: state.section,
        cursor: state.cursor,
        seen: state.seen,
        bookmarks: state.bookmarks,
        bookmarkFilter: state.bookmarkFilter,
        streak: state.streak,
        lastActiveDay: state.lastActiveDay,
        dailyCount: state.dailyCount,
        dailyDay: state.dailyDay,
        onboarded: state.onboarded,
        scriptMode: state.scriptMode,
      }),
    },
  ),
);

export function currentKuralNumber(state: Pick<PathState, "section" | "cursor">) {
  return state.cursor[state.section];
}
