import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  SECTION_BY_ID,
  type SectionId,
  sections,
  shortSectionName,
} from "@/lib/kural-data";
import { usePathStore } from "@/lib/store";

export function SectionTabs() {
  const section = usePathStore((s) => s.section);
  const seen = usePathStore((s) => s.seen);
  const setSection = usePathStore((s) => s.setSection);
  const scriptMode = usePathStore((s) => s.scriptMode);

  return (
    <div
      role="tablist"
      aria-label="Thirukkural sections"
      className="grid grid-cols-3 gap-1 rounded-md bg-bg-raised p-1"
    >
      {sections.map((item) => {
        const active = item.id === section;
        const total = item.end - item.start + 1;
        let read = 0;
        for (let n = item.start; n <= item.end; n++) if (seen[n]) read += 1;
        const complete = read === total;
        const names = shortSectionName(item);
        const isTr = scriptMode === "transliteration";
        const primaryTitle = isTr ? names.tr : names.ta;
        const secondaryTitle = isTr ? names.ta : names.en;

        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => setSection(item.id as SectionId)}
            className={cn(
              "relative flex min-h-8 sm:min-h-9 landscape:min-h-7 flex-row items-center justify-center gap-1.5 rounded-sm px-1 py-1 landscape:py-0.5 transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.97]",
              active
                ? "bg-paper text-ink shadow-sm"
                : "text-on-dark-muted hover:text-on-dark",
            )}
          >
            <span
              className="flex items-center gap-1 font-tamil text-xs font-semibold"
              lang={isTr ? "en" : "ta"}
            >
              {primaryTitle}
              {complete ? <Check className="size-3" strokeWidth={2.2} /> : null}
            </span>
            <span className="hidden sm:inline text-[10px] opacity-75">
              · {secondaryTitle}
            </span>
            <span
              className="absolute inset-x-1.5 bottom-0.5 h-0.5 overflow-hidden rounded-full bg-line/50"
              aria-hidden="true"
            >
              <span
                className={cn(
                  "block h-full origin-left rounded-full",
                  active ? "bg-accent" : "bg-on-dark-subtle",
                )}
                style={{ width: `${Math.round((read / total) * 100)}%` }}
              />
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function sectionProgressLabel(section: SectionId, seen: Record<number, true>) {
  const { start, end } = SECTION_BY_ID[section];
  let read = 0;
  for (let n = start; n <= end; n++) if (seen[n]) read += 1;
  return { read, total: end - start + 1 };
}
