import { useEffect, useMemo, useState } from "react";
import { BookmarkCheck, ChevronLeft, ChevronRight, Flame, Languages } from "lucide-react";
import { InstallButton } from "@/components/pwa";
import { JumpSheet } from "@/components/jump-sheet";
import { BookmarksSheet } from "@/components/bookmarks-sheet";
import { SectionTabs } from "@/components/section-tabs";
import { SwipeStage } from "@/components/swipe-stage";
import {
  DAILY_GOAL,
  SECTION_BY_ID,
  TOTAL_KURALS,
  getChapter,
} from "@/lib/kural-data";
import {
  trackBookmarkFilter,
  trackJumpSheet,
  trackKuralView,
  trackOpenBookmarksList,
  trackScriptToggle,
} from "@/lib/analytics";
import { currentKuralNumber, usePathStore } from "@/lib/store";

export function Reader() {
  const hydrated = usePathStore((s) => s.hydrated);
  const section = usePathStore((s) => s.section);
  const cursor = usePathStore((s) => s.cursor);
  const seen = usePathStore((s) => s.seen);
  const streak = usePathStore((s) => s.streak);
  const dailyCount = usePathStore((s) => s.dailyCount);
  const dailyDay = usePathStore((s) => s.dailyDay);
  const onboarded = usePathStore((s) => s.onboarded);
  const scriptMode = usePathStore((s) => s.scriptMode);
  const toggleScriptMode = usePathStore((s) => s.toggleScriptMode);

  const bookmarks = usePathStore((s) => s.bookmarks);
  const bookmarkFilter = usePathStore((s) => s.bookmarkFilter);
  const toggleBookmarkFilter = usePathStore((s) => s.toggleBookmarkFilter);

  const bookmarksList = useMemo(
    () => Object.keys(bookmarks).map(Number).sort((a, b) => a - b),
    [bookmarks],
  );

  const next = usePathStore((s) => s.next);
  const prev = usePathStore((s) => s.prev);
  const markSeen = usePathStore((s) => s.markSeen);
  const completeOnboarding = usePathStore((s) => s.completeOnboarding);
  const [jumpOpen, setJumpOpen] = useState(false);
  const [bookmarksOpen, setBookmarksOpen] = useState(false);

  const number = currentKuralNumber({ section, cursor });
  const bounds = SECTION_BY_ID[section];

  // Navigation bounds
  let canPrev = number > bounds.start;
  let canNext = number < bounds.end;
  if (bookmarkFilter) {
    canPrev = bookmarksList.some((n) => n < number);
    canNext = bookmarksList.some((n) => n > number);
  }

  const seenTotal = Object.keys(seen).length;
  const todayGoal = dailyDay ? Math.min(dailyCount, DAILY_GOAL) : 0;
  const chapter = getChapter(number);
  const showOnboarding = hydrated && !onboarded;

  useEffect(() => {
    const store = usePathStore;
    void Promise.resolve(store.persist.rehydrate()).then(() => {
      store.getState().setHydrated(true);
      const state = store.getState();
      state.markSeen(state.cursor[state.section]);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    markSeen(number);
    trackKuralView(number, section, chapter.ta);
  }, [hydrated, number, markSeen, section, chapter.ta]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.target instanceof HTMLInputElement) return;
      if (event.key === "ArrowRight") {
        event.preventDefault();
        next();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        prev();
      } else if (event.key === "1") {
        usePathStore.getState().setSection("aram");
      } else if (event.key === "2") {
        usePathStore.getState().setSection("porul");
      } else if (event.key === "3") {
        usePathStore.getState().setSection("inbam");
      } else if (event.key === "g" || event.key === "G" || event.key === "/") {
        event.preventDefault();
        setJumpOpen(true);
      } else if (event.key === "b" || event.key === "B") {
        event.preventDefault();
        setBookmarksOpen((o) => !o);
      } else if (event.key === "t" || event.key === "T") {
        toggleScriptMode();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, toggleScriptMode]);

  const isTr = scriptMode === "transliteration";
  const bookmarkIdx = bookmarksList.indexOf(number);

  return (
    <main className="relative mx-auto flex h-dvh w-full max-w-lg flex-col overflow-hidden bg-bg px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] text-on-dark landscape:max-w-3xl landscape:px-14 landscape:pt-1.5 landscape:pb-1.5 sm:landscape:max-w-4xl">
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between gap-2 pb-1.5 pt-0.5 landscape:pb-1 landscape:pt-0">
        <div className="flex items-baseline gap-2 min-w-0">
          <h1 className="font-tamil text-lg font-semibold tracking-tight leading-none landscape:text-base" lang={isTr ? "en" : "ta"}>
            {isTr ? "Thirukkural" : "திருக்குறள்"}
          </h1>
          <span className="text-[11px] text-on-dark-muted tabular-nums shrink-0">
            {seenTotal}/{TOTAL_KURALS}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Bookmark Mode Filter Toggle Button */}
          <button
            type="button"
            onClick={() => {
              toggleBookmarkFilter();
              trackBookmarkFilter(!bookmarkFilter);
            }}
            title={bookmarkFilter ? "Switch to All Kurals" : "Navigate Bookmarked Kurals Only"}
            aria-label="Toggle Bookmarked Navigation Mode"
            className={`inline-flex h-8 sm:h-9 landscape:h-7.5 items-center gap-1 rounded-md border px-2.5 text-xs landscape:text-[11px] font-medium transition-all duration-150 ease-out active:scale-[0.96] ${
              bookmarkFilter
                ? "border-accent bg-accent text-paper font-semibold shadow-sm"
                : "border-border-dark bg-bg-raised text-on-dark hover:border-muted"
            }`}
          >
            <BookmarkCheck className={`size-3.5 ${bookmarkFilter ? "text-paper" : "text-accent"}`} strokeWidth={2} />
            <span>Bookmarks</span>
          </button>

          {/* Bookmarks Drawer Trigger Button */}
          <button
            type="button"
            onClick={() => {
              setBookmarksOpen(true);
              trackOpenBookmarksList(bookmarksList.length);
            }}
            title="View All Bookmarks"
            aria-label="Open Bookmarked Kurals List"
            className="relative inline-flex h-8 sm:h-9 landscape:h-7.5 items-center justify-center rounded-md border border-border-dark bg-bg-raised px-2 text-xs landscape:text-[11px] font-medium text-on-dark transition-transform duration-150 ease-out active:scale-[0.96]"
          >
            <span className="tabular-nums font-semibold text-accent">{bookmarksList.length}</span>
          </button>

          {/* Script mode toggle button */}
          <button
            type="button"
            onClick={() => {
              toggleScriptMode();
              trackScriptToggle(scriptMode === "tamil" ? "transliteration" : "tamil");
            }}
            title="Toggle Tamil / English Letters Transliteration"
            aria-label="Toggle Tamil / Transliteration script"
            className="inline-flex h-8 sm:h-9 landscape:h-7.5 items-center gap-1.5 rounded-md border border-border-dark bg-bg-raised px-2.5 text-xs landscape:text-[11px] font-medium text-on-dark transition-transform duration-150 ease-out active:scale-[0.96]"
          >
            <Languages className="size-3.5 text-accent" strokeWidth={1.75} />
            <span>{isTr ? "English" : "தமிழ்"}</span>
          </button>

          <div
            className="inline-flex h-8 sm:h-9 landscape:h-7.5 items-center gap-1 rounded-md border border-border-dark bg-bg-raised px-2 text-xs landscape:text-[11px] tabular-nums text-on-dark"
            aria-label={`Streak ${streak} days`}
          >
            <Flame className="size-3.5 text-accent" strokeWidth={1.75} />
            <span>{streak}</span>
          </div>
          <InstallButton className="landscape:h-7.5 landscape:text-[11px]" />
        </div>
      </header>

      {/* Section Tabs */}
      <div className="shrink-0">
        <SectionTabs />
      </div>

      {/* Subheader Status */}
      <div className="mt-1 landscape:mt-0.5 flex shrink-0 items-center justify-between text-xs text-on-dark-muted px-0.5">
        <button
          type="button"
          onClick={() => {
            setJumpOpen(true);
            trackJumpSheet("open");
          }}
          className="flex items-center gap-1.5 rounded-md text-left transition-opacity duration-150 hover:text-on-dark py-0.5"
        >
          <span className="font-tamil text-xs font-medium text-on-dark truncate" lang={isTr ? "en" : "ta"}>
            {isTr ? chapter.tr : chapter.ta}
          </span>
          <span className="text-[11px] text-on-dark-muted">
            (Adhigaram {chapter.n})
          </span>
        </button>
        <div className="flex items-center gap-2">
          {bookmarkFilter ? (
            <span className="inline-flex items-center gap-1 text-[11px] text-accent font-semibold tabular-nums bg-accent/10 px-2 py-0.5 rounded">
              <BookmarkCheck className="size-3" />
              {bookmarkIdx >= 0 ? `${bookmarkIdx + 1} of ${bookmarksList.length}` : `Bookmarks`}
            </span>
          ) : (
            <span className="tabular-nums text-[11px] text-on-dark-muted">
              {number - bounds.start + 1}/{bounds.end - bounds.start + 1}
            </span>
          )}
        </div>
      </div>

      {/* Main Swipe Stage Container */}
      <div className="relative mt-1.5 landscape:mt-1 min-h-0 flex-1 overflow-hidden">
        <SwipeStage
          number={number}
          canPrev={canPrev}
          canNext={canNext}
          onPrev={prev}
          onNext={next}
        />

        {showOnboarding ? (
          <div className="absolute inset-0 z-10 flex items-end rounded-xl bg-bg/55 p-4 sm:p-5">
            <div className="w-full rounded-lg bg-paper p-4 text-ink shadow-paper sm:p-5">
              <p className="font-tamil text-base font-semibold" lang="ta">
                {isTr ? "Oru Kural. Oru Attai." : "ஒரு குறள். ஒரு அட்டை."}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Swipe left for next, right for previous. Tap the bookmark icon to save favorite quotes and filter navigation by bookmarks.
              </p>
              <button
                type="button"
                onClick={completeOnboarding}
                className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-md bg-ink text-sm font-medium text-paper transition-transform duration-150 ease-out active:scale-[0.96]"
              >
                Begin the path
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Portrait Navigation Panel (Sticky at bottom) */}
      <nav
        className="sticky bottom-0 z-20 mt-2 grid shrink-0 grid-cols-[3rem_1fr_3rem] items-center gap-3 bg-bg pt-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] landscape:hidden"
      >
        <button
          type="button"
          onClick={prev}
          disabled={!canPrev}
          aria-label="Previous kural"
          className="inline-flex size-12 items-center justify-center rounded-md border border-border-dark bg-bg-raised text-on-dark transition-transform duration-150 ease-out active:scale-[0.96] disabled:opacity-30"
        >
          <ChevronLeft className="size-6" />
        </button>
        <button
          type="button"
          onClick={() => setJumpOpen(true)}
          className="flex h-12 items-center justify-center rounded-md border border-border-dark bg-bg-raised text-sm tabular-nums text-on-dark transition-transform duration-150 ease-out active:scale-[0.96]"
        >
          {bookmarkFilter ? `Bookmark ${bookmarkIdx >= 0 ? bookmarkIdx + 1 : "-"}/${bookmarksList.length}` : `Kural ${number}`}
        </button>
        <button
          type="button"
          onClick={next}
          disabled={!canNext}
          aria-label="Next kural"
          className="inline-flex size-12 items-center justify-center rounded-md border border-border-dark bg-bg-raised text-on-dark transition-transform duration-150 ease-out active:scale-[0.96] disabled:opacity-30"
        >
          <ChevronRight className="size-6" />
        </button>
      </nav>

      {/* Landscape Left & Right Floating Navigation Controls */}
      <button
        type="button"
        onClick={prev}
        disabled={!canPrev}
        aria-label="Previous kural"
        className="fixed left-3 top-1/2 z-30 hidden -translate-y-1/2 size-12 items-center justify-center rounded-full border border-border-dark bg-bg-raised/90 text-on-dark shadow-md backdrop-blur-sm transition-transform duration-150 ease-out active:scale-[0.96] disabled:opacity-30 landscape:inline-flex"
      >
        <ChevronLeft className="size-7" />
      </button>

      <button
        type="button"
        onClick={next}
        disabled={!canNext}
        aria-label="Next kural"
        className="fixed right-3 top-1/2 z-30 hidden -translate-y-1/2 size-12 items-center justify-center rounded-full border border-border-dark bg-bg-raised/90 text-on-dark shadow-md backdrop-blur-sm transition-transform duration-150 ease-out active:scale-[0.96] disabled:opacity-30 landscape:inline-flex"
      >
        <ChevronRight className="size-7" />
      </button>

      <JumpSheet open={jumpOpen} onOpenChange={setJumpOpen} />
      <BookmarksSheet open={bookmarksOpen} onOpenChange={setBookmarksOpen} />
    </main>
  );
}
