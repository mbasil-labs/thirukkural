import { useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  TOTAL_KURALS,
  chapters,
  clampKural,
  sections,
  shortSectionName,
  type SectionId,
} from "@/lib/kural-data";
import { trackJumpSheet } from "@/lib/analytics";
import { usePathStore } from "@/lib/store";

export function JumpSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const goTo = usePathStore((s) => s.goTo);
  const current = usePathStore((s) => s.cursor[s.section]);
  const seen = usePathStore((s) => s.seen);
  const scriptMode = usePathStore((s) => s.scriptMode);
  const [value, setValue] = useState(String(current));

  const grouped = useMemo(
    () =>
      sections.map((section) => ({
        section,
        chapters: chapters.filter((chapter) => chapter.section === section.id),
      })),
    [],
  );

  function jump(n: number) {
    const target = clampKural(n);
    goTo(target);
    trackJumpSheet("select", target);
    onOpenChange(false);
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-bg/70" />
        <Dialog.Content
          className="fixed inset-x-0 bottom-0 z-50 flex max-h-[86dvh] flex-col overflow-hidden rounded-t-xl bg-bg-raised text-on-dark shadow-paper outline-none"
          aria-describedby={undefined}
        >
          <div className="flex shrink-0 items-center justify-between px-5 pt-5 pb-3">
            <Dialog.Title className="font-display text-lg font-medium">
              Jump to a kural
            </Dialog.Title>
            <Dialog.Close
              className="inline-flex size-11 items-center justify-center rounded-md text-on-dark-muted transition-transform duration-150 ease-out active:scale-[0.96]"
              aria-label="Close"
            >
              <X className="size-5" />
            </Dialog.Close>
          </div>

          <form
            className="flex shrink-0 gap-2 px-5 pb-4"
            onSubmit={(event) => {
              event.preventDefault();
              const n = Number.parseInt(value, 10);
              if (Number.isFinite(n)) jump(n);
            }}
          >
            <input
              inputMode="numeric"
              pattern="[0-9]*"
              min={1}
              max={TOTAL_KURALS}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              aria-label="Kural number"
              className="h-11 min-w-0 flex-1 rounded-md border border-border-dark bg-bg px-3 text-base text-on-dark outline-none ring-accent focus:ring-2"
              placeholder="1–1330"
            />
            <button
              type="submit"
              className="h-11 rounded-md bg-paper px-4 text-sm font-medium text-ink transition-transform duration-150 ease-out active:scale-[0.96]"
            >
              Go
            </button>
          </form>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8">
            {grouped.map(({ section, chapters: list }) => {
              const names = shortSectionName(section);
              const isTr = scriptMode === "transliteration";
              return (
                <section key={section.id} className="mb-6">
                  <h3 className="sticky top-0 z-10 bg-bg-raised py-2 font-tamil text-sm font-semibold text-accent flex items-center gap-2">
                    <span lang={isTr ? "en" : "ta"}>{isTr ? `${names.tr} (${names.ta})` : names.ta}</span>
                    <span className="font-display font-medium text-on-dark-muted">
                      · {names.en}
                    </span>
                  </h3>
                  <ol className="flex flex-col gap-1">
                    {list.map((chapter) => {
                      let read = 0;
                      for (let n = chapter.start; n <= chapter.end; n++) {
                        if (seen[n]) read += 1;
                      }
                      const active =
                        current >= chapter.start && current <= chapter.end;
                      return (
                        <li key={chapter.n}>
                          <button
                            type="button"
                            onClick={() => jump(chapter.start)}
                            className={cn(
                              "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors duration-150",
                              active ? "bg-paper text-ink" : "hover:bg-bg",
                            )}
                          >
                            <span className="w-8 shrink-0 text-sm tabular-nums text-muted">
                              {chapter.n}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span
                                className="block truncate font-tamil text-sm font-semibold"
                                lang={isTr ? "en" : "ta"}
                              >
                                {isTr ? chapter.tr : chapter.ta}
                              </span>
                              <span className="block truncate text-xs text-on-dark-muted">
                                {isTr ? `${chapter.ta} · ${chapter.en}` : chapter.en}
                              </span>
                            </span>
                            <span className="shrink-0 text-xs tabular-nums text-muted">
                              {read}/10
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ol>
                </section>
              );
            })}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export type { SectionId };
