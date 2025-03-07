import { Create } from "@/components/creat-element";
import { NotificationManager } from "@/components/Notification";
import { Book, Minus, Plus, createElement } from "lucide";
import { db } from "@/db";
// Type definitions
interface NovelData {
  name: string;
  cover: string;
  novelChapters: number;
  uri: string;
}

// Constants
const ACTIONS = {
  READING: "reading",
  REMOVE: "remove",
  PLANNING: "planning",
} as const;

export class NovelLibraryManager {
  private static selectors = {
    linksContainer: "#init-links",
    buttonsContainer: "#lib-container",
    followInfo: "#follow-info",
    novelTitle: ".post-title > h1:nth-child(1)",
    novelCover: ".summary_image > a:nth-child(1) > img:nth-child(1)",
    novelChapters: "li > ul > li > ul > li > a",
    novelDataContainer: "div.summary_content_wrap  div.post-content",
  };

  /**
   * Extract novel details from the current page
   * @returns {NovelData} Novel information
   */
  private static extractNovelDetails(): NovelData {
    const novelId = window.location.pathname.split("/")[2];
    const novelName =
      document
        .querySelector<HTMLHeadingElement>(this.selectors.novelTitle)
        ?.textContent?.trim() ?? "Unknown";
    const novelCover =
      document.querySelector<HTMLImageElement>(this.selectors.novelCover)
        ?.src ?? "#";
    const chapterElements = document.querySelectorAll<HTMLAnchorElement>(
      this.selectors.novelChapters
    );

    return {
      name: novelName,
      uri: novelId,
      cover: novelCover,
      novelChapters: chapterElements.length,
    };
  }

  /**
   * Update the UI to reflect the novel's library status
   */
  private static async updateNovelStatus(): Promise<void> {
    const novelId = window.location.pathname.split("/")[2];
    const buttonsContainer = document.querySelector<HTMLDivElement>(
      this.selectors.buttonsContainer
    );
    const infoContent = document.querySelector<HTMLDivElement>(
      this.selectors.followInfo
    );

    if (!buttonsContainer || !infoContent) return;

    const indexed = await db.novels.where({ uri: novelId }).first();

    if (indexed) {
      buttonsContainer.setAttribute("data-indexed", "true");
      const readingState =
        indexed.status === "reading"
          ? "يقرأ"
          : indexed.status === "completed"
          ? "تم أنهاءه"
          : indexed.status === "dropped"
          ? "تم التخلي عنه"
          : "يخطط للقراءة";
      infoContent.textContent = readingState;
    } else {
      buttonsContainer.setAttribute("data-indexed", "false");
      infoContent.textContent = "لا يتم اتباع هذا الكتاب في المكتبة";
    }
  }

  /**
   * Handle novel library actions (add, remove, planning)
   * @param param0 Novel data and action type
   */
  private static async handleNovelAction({
    novel,
    to,
  }: {
    novel: NovelData;
    to: "reading" | "remove" | "planning";
  }): Promise<void> {
    if (to === ACTIONS.REMOVE) {
      const indexed = await db.novels.where({ uri: novel.uri }).first();
      if (!indexed) return;

      await db.novels.where({ id: indexed.id }).delete();
    } else {
      await db.novels.add({
        ...novel,
        status: to === ACTIONS.PLANNING ? "planToRead" : "reading",
      });
    }

    await this.updateNovelStatus();
  }

  /**
   * Create notification based on action
   * @param action Action type
   */
  private static showNotification(action: string): void {
    const notificationMap = {
      [ACTIONS.REMOVE]: {
        message: "Removed from library",
        variant: "success" as const,
      },
      [ACTIONS.PLANNING]: {
        message: "Planning to read",
        variant: "warning" as const,
      },
      [ACTIONS.READING]: {
        message: "Added to library",
        variant: "success" as const,
      },
    };

    const notification =
      notificationMap[action as keyof typeof notificationMap];
    if (notification) {
      NotificationManager.show({
        message: notification.message,
        variant: notification.variant,
      });
    }
  }

  /**
   * Create library management buttons
   * @returns {HTMLDivElement} Buttons container
   */
  private static createLibraryButtons(): HTMLDivElement {
    const buttonsContainer = Create.div({
      id: "lib-container",
      className: "tw:flex tw:flex-col tw:p-4 tw:w-full tw:h-full tw:gap-4",
    });

    const buttons = [
      {
        id: "reading-btn",
        text: "Add to Library",
        icon: Plus,
        action: ACTIONS.READING,
      },
      {
        id: "planning-btn",
        text: "Planning to read",
        icon: Book,
        action: ACTIONS.PLANNING,
        variant: "muted" as const,
      },
      {
        id: "remove-btn",
        text: "Remove from Library",
        icon: Minus,
        action: ACTIONS.REMOVE,
        variant: "destructive" as const,
      },
    ];

    buttons.forEach(({ id, text, icon, action, variant }) => {
      const button = Create.endlessButton({
        id,
        textContent: text,
        children: createElement(icon),
        variant,
      });
      button.setAttribute("data-action", action);
      buttonsContainer.appendChild(button);
    });

    buttonsContainer.addEventListener(
      "click",
      this.handleButtonClick.bind(this)
    );

    return buttonsContainer;
  }

  /**
   * Handle button click events
   * @param e Click event
   */
  private static handleButtonClick(e: Event): void {
    const target = e.target as HTMLButtonElement;
    if (target.tagName !== "BUTTON") return;

    const action = target.getAttribute("data-action");
    if (!action) return;

    const novelData = this.extractNovelDetails();
    this.handleNovelAction({
      novel: novelData,
      to: action as "reading" | "remove" | "planning",
    });
    this.showNotification(action);
  }

  /**
   * Create and append follow information to the page
   */
  private static createFollowInfo(): void {
    const novelDataContainer = document.querySelector(
      this.selectors.novelDataContainer
    );
    if (!novelDataContainer) return;

    const infoContainer = Create.div({
      className: "post-content_item",
    });

    const infoTitle = Create.div({
      className: "summary-heading",
    });
    infoTitle.innerHTML = "<h5>متابعة</h5>";

    const infoContent = Create.div({
      id: "follow-info",
      className: "summary-content",
    });

    infoContainer.appendChild(infoTitle);
    infoContainer.appendChild(infoContent);
    novelDataContainer.appendChild(infoContainer);
  }

  /**
   * Initialize the novel library management page
   */
  static async init(): Promise<void> {
    this.createFollowInfo();

    const linksContainer = document.querySelector(
      this.selectors.linksContainer
    );
    if (!linksContainer) return;

    const buttonsContainer = this.createLibraryButtons();
    linksContainer.appendChild(buttonsContainer);
    buttonsContainer.style.display = "none";

    await this.updateNovelStatus();
    buttonsContainer.style.removeProperty("display");
  }
}
