import { Bookmark, BookmarkCheck } from "lucide-react";
import { getChapter, getKural, splitEnglishLines } from "@/lib/kural-data";
import { usePathStore } from "@/lib/store";

export function KuralCard({ number }: { number: number }) {
  const scriptMode = usePathStore((s) => s.scriptMode);
  const bookmarks = usePathStore((s) => s.bookmarks);
  const isBookmarked = Boolean(bookmarks[number]);
  const toggleBookmark = usePathStore((s) => s.toggleBookmark);

  const kural = getKural(number);
  const chapter = getChapter(number);
  const inChapter = number - chapter.start + 1;
  const english = splitEnglishLines(kural.en);

  const isTamil = scriptMode === "tamil";

  return (
    <article
      className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-xl bg-paper px-6 py-4 text-ink shadow-paper sm:px-8 sm:py-6 landscape:px-6 landscape:py-3.5"
      aria-label={`Kural ${number}`}
    >
      <header className="flex shrink-0 items-start justify-between gap-4">
        <div className="min-w-0">
          <p
            className="font-tamil text-sm font-semibold text-ink leading-snug"
            lang={isTamil ? "ta" : "en"}
          >
            {isTamil ? chapter.ta : chapter.tr}
          </p>
          <p className="mt-0.5 text-xs italic text-ink-soft">{chapter.en}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => toggleBookmark(number)}
            title={isBookmarked ? "Remove Bookmark" : "Bookmark this Kural"}
            aria-label={isBookmarked ? "Remove Bookmark" : "Bookmark Kural"}
            className="inline-flex size-9 items-center justify-center rounded-full transition-transform duration-150 active:scale-90 focus:outline-none"
          >
            {isBookmarked ? (
              <BookmarkCheck className="size-5 text-accent fill-accent/20" strokeWidth={2} />
            ) : (
              <Bookmark className="size-5 text-muted hover:text-ink" strokeWidth={1.75} />
            )}
          </button>
          <p className="text-right">
            <span className="block font-display text-2xl font-medium tabular-nums leading-none tracking-tight text-accent">
              {number}
            </span>
            <span className="mt-0.5 block text-xs tabular-nums text-muted">
              {inChapter}/10
            </span>
          </p>
        </div>
      </header>

      <div className="mt-2.5 landscape:mt-1.5 shrink-0 h-px bg-line" />

      {/* Main scrollable body */}
      <div className="flex min-h-0 flex-1 flex-col justify-start gap-3.5 overflow-y-auto py-2.5 landscape:gap-2.5 landscape:py-1.5">
        {/* Tamil / Transliteration Couplet Box */}
        <div className="shrink-0">
          {isTamil ? (
            <div lang="ta" className="font-tamil">
              <p className="text-verse font-semibold leading-relaxed text-ink">{kural.ta[0]}</p>
              <p className="text-verse mt-1 font-semibold leading-relaxed text-ink">{kural.ta[1]}</p>
            </div>
          ) : (
            <div className="font-sans">
              <p className="text-verse font-semibold leading-relaxed text-ink">{kural.tr[0]}</p>
              <p className="text-verse mt-1 font-semibold leading-relaxed text-ink">{kural.tr[1]}</p>
            </div>
          )}

          {/* Subtitle displaying alternate form */}
          <p className="mt-1.5 text-xs italic leading-relaxed text-ink-soft">
            {isTamil ? `${kural.tr[0]} · ${kural.tr[1]}` : `${kural.ta[0]} · ${kural.ta[1]}`}
          </p>
        </div>

        <div className="shrink-0 h-px bg-line" />

        {/* English Translation */}
        <div className="shrink-0">
          {english.map((line) => (
            <p
              key={line}
              className="text-verse font-medium leading-relaxed text-ink"
            >
              {line}
            </p>
          ))}
        </div>
      </div>
    </article>
  );
}
