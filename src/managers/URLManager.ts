import { UNIVERSAL_CONFIG } from "../config/universal-config";

export class URLManager {
  constructor() {
    this.setupURLUpdates();
  }

  private updateURL(chapter: HTMLElement | null): void {
    if (!chapter) return;

    const chapterUrl = chapter.getAttribute("data-url");
    if (chapterUrl && window.location.href !== chapterUrl) {
      history.replaceState({ chapterUrl }, "", chapterUrl);
    }
  }

  private findMostVisibleChapter(): HTMLElement | null {
    const readingContents =
      document.querySelectorAll<HTMLDivElement>(".chapter-container");
    if (!readingContents) return null;

    const chapters = Array.from(readingContents);
    const viewportHeight = window.innerHeight;
    let mostVisibleChapter: HTMLElement | null = null;
    let maxVisiblePercentage = 0;

    chapters.forEach((chapter) => {
      const rect = chapter.getBoundingClientRect();
      const visibleHeight =
        Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
      const visiblePercentage =
        (visibleHeight / Math.min(rect.height, viewportHeight)) * 100;

      if (visiblePercentage > maxVisiblePercentage) {
        maxVisiblePercentage = visiblePercentage;
        mostVisibleChapter = chapter as HTMLElement;
      }
    });

    return maxVisiblePercentage > UNIVERSAL_CONFIG.urlUpdateThreshold
      ? mostVisibleChapter
      : null;
  }

  private setupURLUpdates(): void {
    const updateURL = () => {
      const mostVisibleChapter = this.findMostVisibleChapter();
      this.updateURL(mostVisibleChapter);
    };

    window.addEventListener("scroll", this.debounce(updateURL, 50));
    setInterval(updateURL, 1000);
  }

  private debounce(func: Function, wait: number): (...args: any[]) => void {
    let timeoutId: number | undefined;
    return (...args: any[]) => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => func(...args), wait);
    };
  }
}
