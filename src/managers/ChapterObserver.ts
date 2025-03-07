import { Create } from "@/components/creat-element";
import { NotificationManager } from "@/components/Notification";
import { SiteConfig } from "@/config/site-config";
import { UNIVERSAL_CONFIG } from "@/config/universal-config";
import { Chapter, db } from "@/db";
import { DOMUtils } from "@/utils/dom";
import { Book, createElement } from "lucide";
import { URLManager } from "./URLManager";

interface TrackingState {
  start: boolean;
  end: boolean;
}

type ChapterData = {
  nextChapterUrl: string | null;
  chapter: Chapter | null;
};

export class ElementViewTracker {
  private observedElements = new Set<HTMLElement>();
  private ElementObservers = new Map<number, IntersectionObserver>();
  private mutationObserver: MutationObserver | null = null;
  private config: SiteConfig;
  private novelId: number | null = null;
  private trackingState = new Map<number, TrackingState>();
  private currentChapterData: ChapterData;
  private options = new Set<string>();

  constructor(config: SiteConfig) {
    this.config = config;
    this.init(config).then(() => this.setupTracking());

    this.currentChapterData = {
      chapter: null,
      nextChapterUrl: null,
    };
    // Bind methods to preserve 'this' context
    this.startFunction = this.startFunction.bind(this);
    this.middleFunction = this.middleFunction.bind(this);
    this.endFunction = this.endFunction.bind(this);
  }

  /**
   * Set up all tracking functionality
   */
  private setupTracking(): void {
    // Initialize current Chapter
    this.setupCurrentChapter();

    // Initial tracking on page load
    const trackInitially = () => this.observeNewElements();

    // Different methods of initialization to ensure robustness
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", trackInitially);
    } else {
      trackInitially();
    }

    // Set up mutation observer to track dynamically added elements
    this.mutationObserver = new MutationObserver(() =>
      this.observeNewElements()
    );
    this.mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  /**
   * Track the view status of a specific element
   */
  private async trackElementView({
    element,
    index,
    percent,
  }: {
    element: Element;
    index: number;
    percent: number;
  }): Promise<void> {
    const initialState = {
      start: false,
      end: false,
    };

    if (this.ElementObservers.has(index)) return;

    const currentState = this.trackingState.get(index) || initialState;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const placement = entry.target.getAttribute("data-placement");
            if (placement === "top" && !currentState.start) {
              this.startFunction(element);
              this.trackingState.set(index, {
                ...currentState,
                start: true,
              });
            } else if (placement === "bottom" && !currentState.end) {
              this.endFunction(element);
              this.trackingState.set(index, {
                ...currentState,
                end: true,
              });
            } else if (currentState.start && !currentState.end) {
              this.middleFunction(element, percent);
            }
            observer.unobserve(element);
          }
        });
      },
      {
        rootMargin: "0px",
        threshold: 0.5,
      }
    );

    observer.observe(element);
    this.ElementObservers.set(index, observer);
  }

  /**
   * Fetch and process the next chapter
   */
  private async fetchNextChapter(url: string): Promise<void> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      const doc = new DOMParser().parseFromString(text, "text/html");

      const { container, nextChapterUrl, title } = processChapterContent(
        doc,
        this.config,
        url
      );

      const userOptions = this.createUserOptions(
        title,
        url,
        this.config.chapterFuncs.openSettingsFunc
      );
      if (userOptions) container.append(userOptions);

      Object.assign(container.style, {
        fontSize: "var(--font-size)",
        lineHeight: "var(--line-height)",
      });

      const appendToElement = document.querySelector(
        this.config.selectors.appendTo
      );
      appendToElement?.appendChild(container);

      if (this.novelId) {
        this.currentChapterData = {
          chapter: {
            link: url,
            novelId: this.novelId,
            title,
            lastRead: new Date(),
            readingCompletion: 0,
          },
          nextChapterUrl: nextChapterUrl || "404",
        };

        NotificationManager.show({
          message: `New Chapter: ${title}`,
        });
      } else {
        this.currentChapterData = {
          nextChapterUrl: nextChapterUrl || "404",
          chapter: null,
        };
      }
    } catch (error) {
      console.error("Error fetching next chapter:", error);
      NotificationManager.show({
        message: "Error loading next chapter",
        variant: "error",
      });
    }
  }

  /**
   * Create user options UI element
   */
  private createUserOptions(
    title: string,
    chapterUrl: string,
    openSettingsFunc: () => void
  ): HTMLDivElement | null {
    if (this.options.has(chapterUrl)) return null;
    this.options.add(chapterUrl);
    return Create.div({
      className: "tw:flex tw:flex-col tw:p-4 tw:w-full tw:h-full tw:gap-4",
      children: [
        Create.a({
          href: chapterUrl,
          textContent: title,
          className: "chapter-options-link endless-link",
          attributes: {
            "data-variant": "outline",
            disabled: chapterUrl ? "false" : "true",
          },
        }),
        Create.a({
          href: this.config.libLink,
          textContent: "Library",
          className: "chapter-options-link endless-link",
          children: createElement(Book),
          attributes: {
            "data-variant": "outline",
            disabled: chapterUrl ? "false" : "true",
          },
        }),
        Create.endlessButton({
          textContent: "Settings",
          clickFunc: openSettingsFunc,
        }),
      ],
    });
  }

  /**
   * Start view logging function - called when element enters viewport at top
   */
  private async startFunction(el: Element): Promise<void> {
    if (!this.novelId || !this.currentChapterData) return;

    if (!this.currentChapterData.chapter) return;

    const readChapter = await db.chapters
      .where({ link: this.currentChapterData.chapter.link })
      .first();
    if (readChapter) return;

    const chapter = await db.chapters.add({
      novelId: this.novelId,
      title: this.currentChapterData.chapter.title,
      lastRead: new Date(),
      link: this.currentChapterData.chapter.link,
      readingCompletion: 0,
    });

    el.setAttribute("data-chapter-id", chapter.toString());
  }

  /**
   * Middle view logging function - called when element is in viewport
   */
  private async middleFunction(el: Element, percent: number): Promise<void> {
    if (!this.novelId || !this.currentChapterData) return;
    if (!this.currentChapterData.chapter) return;

    const chapter = await db.chapters
      .where({ link: this.currentChapterData.chapter.link })
      .first();

    if (!chapter) {
      const newChapter = await db.chapters.add({
        novelId: this.novelId,
        title: this.currentChapterData.chapter.title,
        lastRead: new Date(),
        link: this.currentChapterData.chapter.link,
        readingCompletion: percent,
      });
      el.setAttribute("data-chapter-id", newChapter.toString());
      return;
    }

    // Only update if the new percentage is higher
    if (chapter.readingCompletion < percent) {
      await db.chapters.update(chapter.id, {
        readingCompletion: percent,
        lastRead: new Date(),
      });
    }
  }

  /**
   * End view logging function - called when element is fully viewed
   */
  private async endFunction(el: Element): Promise<void> {
    if (!this.currentChapterData) return;

    if (this.novelId && this.currentChapterData.chapter) {
      const chapter = await db.chapters
        .where({ link: this.currentChapterData.chapter.link })
        .first();

      if (!chapter) {
        const newChapter = await db.chapters.add({
          novelId: this.novelId,
          title: el.getAttribute("data-chapter-title") as string,
          lastRead: new Date(),
          link: el.getAttribute("data-url") as string,
          readingCompletion: 100,
        });
        el.setAttribute("data-chapter-id", newChapter.toString());
      } else {
        await db.chapters.update(chapter.id, {
          readingCompletion: 100,
          lastRead: new Date(),
        });
      }
    }
    // Load next chapter
    this.loadNextChapter();
  }

  /**
   * Load the next chapter based on current chapter data
   */
  private async loadNextChapter(): Promise<void> {
    const dataNextUrl = this.currentChapterData?.nextChapterUrl;
    if (!dataNextUrl || dataNextUrl === "404") {
      NotificationManager.show({
        message: "No next chapter found",
        variant: "warning",
      });
      return;
    }
    // Check if auto loader is disabled
    if (localStorage.getItem(UNIVERSAL_CONFIG.localStorageKey) === "false")
      return;

    try {
      const urlObject = new URL(dataNextUrl);
      await this.fetchNextChapter(urlObject.href);
    } catch (error) {
      NotificationManager.show({
        message: "Invalid next chapter URL",
        variant: "error",
      });
    }
  }

  /**
   * Extract chapter data from element
   */
  private getChapterData(element: Element): ChapterData | null {
    if (!this.novelId) {
      return {
        chapter: null,
        nextChapterUrl: element.getAttribute("data-next-url") as string,
      };
    } else {
      return {
        chapter: {
          link: element.getAttribute("data-url") as string,
          novelId: this.novelId,
          title: element.getAttribute("data-chapter-title") as string,
          lastRead: new Date(),
          readingCompletion: 0,
        },
        nextChapterUrl: element.getAttribute("data-next-url") as string,
      };
    }
  }

  /**
   * Observe and track all elements with .track-content class
   */
  private observeNewElements(): void {
    document
      .querySelectorAll<HTMLElement>(".track-content")
      .forEach((el, i) => {
        // Prevent re-tracking the same element
        if (this.observedElements.has(el)) return;
        this.observedElements.add(el);

        if (!this.trackingState.has(i)) {
          this.trackingState.set(i, {
            start: false,
            end: false,
          });
        }

        const chapterData = this.getChapterData(el);
        if (chapterData) {
          this.currentChapterData = chapterData;
        }

        // Track each child element for reading progress
        Array.from(el.children).forEach(
          (child, elementIndex, totalElements) => {
            const percent = Math.floor(
              ((elementIndex + 1) / totalElements.length) * 100
            );
            this.trackElementView({
              element: child,
              index: i,
              percent,
            });
          }
        );
      });
  }

  /**
   * Set up the current chapter for tracking
   */
  private setupCurrentChapter(): void {
    const currentUrl = window.location.href;
    const nextUrl = document.querySelector(
      this.config.selectors.nextLink
    ) as HTMLAnchorElement | null;
    const title = document.querySelector(this.config.selectors.title);
    const currentChapter = document.querySelector(
      this.config.selectors.content
    );

    if (!currentChapter) {
      NotificationManager.show({
        message: "Setting up chapter failed!",
        variant: "error",
      });
      return;
    }

    const chapterTitle = title?.textContent ?? "unknown";
    const nextChapterUrl = nextUrl?.href ?? "404";

    // Add user options
    const userOptions = this.createUserOptions(
      chapterTitle,
      nextChapterUrl ? nextChapterUrl : "#",
      this.config.chapterFuncs.openSettingsFunc
    );
    if (userOptions) currentChapter.appendChild(userOptions);

    // Set up the chapter for tracking
    currentChapter.classList.add("chapter-container", "track-content");
    currentChapter.setAttribute("data-url", currentUrl);
    currentChapter.setAttribute("data-chapter-title", chapterTitle);
    currentChapter.setAttribute("data-next-url", nextChapterUrl);

    // Add tracking elements
    const topSentinel = Create.div({
      className: "tw:w-full tw:h-px sentinel",
      attributes: {
        "data-url": currentUrl,
        "data-chapter-title": chapterTitle,
        "data-next-url": nextChapterUrl,
        "data-placement": "top",
        ...(this.novelId ? { "data-novel-id": this.novelId.toString() } : {}),
      },
    });

    const bottomSentinel = Create.div({
      className: "tw:w-full tw:h-px sentinel",
      attributes: {
        "data-url": currentUrl,
        "data-chapter-title": chapterTitle,
        "data-next-url": nextChapterUrl,
        "data-placement": "bottom",
        ...(this.novelId ? { "data-novel-id": this.novelId.toString() } : {}),
      },
    });

    currentChapter.prepend(topSentinel);
    currentChapter.appendChild(bottomSentinel);
  }

  /**
   * Initialize view tracking by retrieving novel ID
   */
  async init(config: SiteConfig): Promise<void> {
    // Get novel uri
    const breadcrumb = document.querySelector(
      config.selectors.NovelBreadCrumb
    ) as HTMLAnchorElement | null;

    if (breadcrumb?.href) {
      try {
        const urlObject = new URL(breadcrumb.href);
        const pathname = urlObject.pathname;
        const pathSegments = pathname.split("/");
        const novelUri = pathSegments.at(-2);

        if (novelUri) {
          const novel = await db.novels.where({ uri: novelUri }).first();
          this.novelId = novel?.id ?? null;
          console.log(
            "🚀 ~ ElementViewTracker ~ init ~ novelId:",
            this.novelId
          );
        }
      } catch (error) {
        console.error("Error parsing novel URL:", error);
      }
    }
  }

  /**
   * Clean up observers (optional method for manual cleanup)
   */
  destroy(): void {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }
    this.observedElements.clear();
    this.trackingState.clear();
    this.ElementObservers.forEach((observer) => {
      observer.disconnect();
    });
    this.ElementObservers.clear();
  }
}

/**
 * Default export to start chapter observer
 */
export default async function startChapterObserver(
  config: SiteConfig
): Promise<void> {
  new ElementViewTracker(config);
  new URLManager();
}

/**
 * Processes chapter content and returns the title, next chapter URL, and container element
 */

function processChapterContent(
  doc: Document,
  config: SiteConfig,
  url: string
): {
  title: string;
  nextChapterUrl: string | null;
  container: HTMLDivElement;
} {
  const containerElement = doc.querySelector<HTMLDivElement>(
    config.selectors.contentContainer
  );
  if (!containerElement) throw new Error("Content container not found");

  if (window.location.hostname === "kolbook.xyz") {
    const classesToRemove = DOMUtils.extractClassesFromStyle(
      doc,
      "article > style:nth-child(2)"
    );
    classesToRemove.forEach((className) => {
      containerElement
        .querySelectorAll(`.${className}`)
        .forEach((el) => el.remove());
    });
  }
  const contentElement = containerElement.querySelector(
    config.selectors.content
  ) as HTMLDivElement | null;
  if (!contentElement) throw new Error("Content element not found");

  const title =
    doc.querySelector(config.selectors.title)?.textContent || "Unknown Chapter";
  const nextChapterUrl =
    doc.querySelector<HTMLAnchorElement>(config.selectors.nextLink)?.href ??
    null;

  const container = Create.div({
    className: "chapter-container track-content",
    attributes: {
      "data-url": url,
      "data-chapter-title": title,
      "data-next-url": nextChapterUrl ?? "404",
    },
    children: [
      Create.div({
        className: "tw:w-full tw:h-px sentianl",
        attributes: {
          "data-url": url,
          "data-chapter-title": title,
          "data-next-url": nextChapterUrl ?? "404",
          "data-placement": "top",
        },
      }),
      ...Array.from(contentElement.children),
      Create.div({
        className: "tw:w-full tw:h-px sentianl",
        attributes: {
          "data-url": url,
          "data-chapter-title": title,
          "data-next-url": nextChapterUrl ?? "404",
          "data-placement": "middle",
        },
      }),
      Create.div({
        className: "tw:w-full tw:h-px sentianl",
        attributes: {
          "data-url": url,
          "data-chapter-title": title,
          "data-next-url": nextChapterUrl ?? "404",
          "data-placement": "bottom",
        },
      }),
    ],
  });

  Object.assign(container.style, {
    fontSize: "var(--font-size)",
    lineHeight: "var(--line-height)",
    fontFamily: "var(--font-family)",
  });

  return {
    title,
    nextChapterUrl,
    container,
  };
}
