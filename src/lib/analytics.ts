declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

export const GA_MEASUREMENT_ID =
  import.meta.env.VITE_GA_MEASUREMENT_ID || "";

export function trackEvent(eventName: string, params?: Record<string, any>) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", eventName, params);
  }
}

export function trackKuralView(number: number, section: string, chapter: string) {
  trackEvent("kural_view", {
    kural_number: number,
    section,
    chapter,
  });

  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    trackEvent("page_view", {
      page_title: `Kural ${number} - ${chapter}`,
      page_location: window.location.href,
      page_path: `${import.meta.env.BASE_URL || "/"}kural/${number}`,
    });
  }
}

export function trackSectionChange(section: string) {
  trackEvent("select_section", {
    section_name: section,
  });
}

export function trackScriptToggle(newMode: "tamil" | "transliteration") {
  trackEvent("toggle_script", {
    script_mode: newMode,
  });
}

export function trackBookmarkToggle(number: number, isBookmarked: boolean) {
  trackEvent(isBookmarked ? "bookmark_remove" : "bookmark_add", {
    kural_number: number,
  });
}

export function trackBookmarkFilter(enabled: boolean) {
  trackEvent("filter_bookmarks", {
    filter_active: enabled,
  });
}

export function trackOpenBookmarksList(totalBookmarks: number) {
  trackEvent("open_bookmarks_list", {
    total_bookmarks: totalBookmarks,
  });
}

export function trackJumpSheet(action: "open" | "select", kuralNumber?: number) {
  trackEvent(action === "open" ? "open_jump_sheet" : "jump_to_kural", {
    ...(kuralNumber ? { kural_number: kuralNumber } : {}),
  });
}

export function trackInstallClick() {
  trackEvent("install_click");
}
