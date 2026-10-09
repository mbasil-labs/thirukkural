import { useMemo } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Bookmark, BookmarkCheck, Trash2, X } from "lucide-react";
import { getChapter, getKural } from "@/lib/kural-data";
import { usePathStore } from "@/lib/store";

export function BookmarksSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const goTo = usePathStore((s) => s.goTo);
  const toggleBookmark = usePathStore((s) => s.toggleBookmark);
  const scriptMode = usePathStore((s) => s.scriptMode);
  const bookmarks = usePathStore((s) => s.bookmarks);
  const currentNumber = usePathStore((s) => s.cursor[s.section]);

  const bookmarksList = useMemo(
    () => Object.keys(bookmarks).map(Number).sort((a, b) => a - b),
    [bookmarks],
  );

  const isTr = scriptMode === "transliteration";

  function jump(n: number) {
    goTo(n);
    onOpenChange(false);
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-bg/70 backdrop-blur-xs" />
        <Dialog.Content
          className="fixed inset-x-0 bottom-0 z-50 flex max-h-[86dvh] flex-col overflow-hidden rounded-t-xl bg-bg-raised text-on-dark shadow-paper outline-none"
          aria-describedby={undefined}
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between px-5 pt-5 pb-3 border-b border-border-dark/60">
            <div className="flex items-center gap-2">
              <BookmarkCheck className="size-5 text-accent" strokeWidth={2} />
              <Dialog.Title className="font-display text-lg font-medium">
                Bookmarked Kurals ({bookmarksList.length})
              </Dialog.Title>
            </div>
            <Dialog.Close
              className="inline-flex size-10 items-center justify-center rounded-md text-on-dark-muted transition-transform duration-150 ease-out active:scale-[0.96] hover:text-on-dark"
              aria-label="Close"
            >
              <X className="size-5" />
            </Dialog.Close>
          </div>

          {/* List or Empty State */}
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5 pb-8">
            {bookmarksList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-on-dark-muted">
                <Bookmark className="size-12 stroke-1 text-on-dark-subtle mb-3" />
                <p className="font-medium text-on-dark text-base">No bookmarked quotes yet</p>
                <p className="mt-1 text-xs max-w-xs leading-relaxed text-on-dark-muted">
                  Tap the bookmark icon on any Kural card to save your favorite couplets here.
                </p>
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {bookmarksList.map((n) => {
                  const kural = getKural(n);
                  const chapter = getChapter(n);
                  const active = currentNumber === n;

                  return (
                    <li key={n}>
                      <div
                        className={`group flex items-start gap-3 rounded-lg border p-3.5 transition-colors duration-150 ${
                          active
                            ? "bg-paper text-ink border-accent/40"
                            : "bg-bg/60 border-border-dark/40 hover:bg-bg"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => jump(n)}
                          className="flex min-w-0 flex-1 flex-col text-left focus:outline-none"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-display font-semibold text-accent text-sm tabular-nums">
                              Kural {n}
                            </span>
                            <span className="text-xs opacity-75 truncate">
                              · {isTr ? chapter.tr : chapter.ta} ({chapter.en})
                            </span>
                          </div>

                          <p
                            className="font-tamil text-sm font-medium leading-snug line-clamp-1"
                            lang={isTr ? "en" : "ta"}
                          >
                            {isTr ? kural.tr[0] : kural.ta[0]}
                          </p>
                          <p
                            className="font-tamil text-xs opacity-80 leading-snug line-clamp-1 mt-0.5"
                            lang={isTr ? "en" : "ta"}
                          >
                            {isTr ? kural.tr[1] : kural.ta[1]}
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleBookmark(n)}
                          title="Remove bookmark"
                          className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-on-dark-subtle hover:text-accent active:scale-95 transition-colors"
                        >
                          <Trash2 className="size-4" strokeWidth={1.75} />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
