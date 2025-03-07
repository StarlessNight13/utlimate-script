import { Create } from "@/components/creat-element";
import { NotificationManager } from "@/components/Notification";
import { db } from "@/db";
import { Book, Minus, Plus, createElement } from "lucide";

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

type ActionType = (typeof ACTIONS)[keyof typeof ACTIONS];

// Notification configuration
const NOTIFICATIONS = {
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

// Base class for novel page management
abstract class NovelPageManager {
  protected abstract selectors: {
    novelTitle: string;
    novelCover: string;
    novelChapters: string;
    novelDataContainer: string;
  };

  protected buttonContainer: HTMLDivElement | null = null;
  protected infoContent: HTMLDivElement | null = null;

  /**
   * Extract novel details from the current page
   */
  protected extractNovelDetails(): NovelData {
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
  protected async updateNovelStatus(): Promise<void> {
    if (!this.buttonContainer || !this.infoContent) return;

    const novelId = window.location.pathname.split("/")[2];
    const indexed = await db.novels.where({ uri: novelId }).first();

    if (indexed) {
      this.buttonContainer.setAttribute("data-indexed", "true");
      const readingState = this.getReadingStateText(indexed.status);
      this.infoContent.textContent = readingState;
    } else {
      this.buttonContainer.setAttribute("data-indexed", "false");
      this.infoContent.textContent = "هذا الكتاب غير موجود في المكتبة";
    }
  }

  /**
   * Get reading state text based on status
   */
  private getReadingStateText(status: string): string {
    switch (status) {
      case "reading":
        return "يقرأ";
      case "completed":
        return "تم أنهاءه";
      case "dropped":
        return "تم التخلي عنه";
      default:
        return "يخطط للقراءة";
    }
  }

  /**
   * Handle novel library actions (add, remove, planning)
   */
  protected async handleNovelAction(
    novel: NovelData,
    action: ActionType
  ): Promise<void> {
    if (action === ACTIONS.REMOVE) {
      const indexed = await db.novels.where({ uri: novel.uri }).first();
      if (indexed) {
        await db.novels.where({ id: indexed.id }).delete();
      }
    } else {
      await db.novels.add({
        ...novel,
        status: action === ACTIONS.PLANNING ? "planToRead" : "reading",
      });
    }

    await this.updateNovelStatus();
    this.showNotification(action);
  }

  /**
   * Create notification based on action
   */
  protected showNotification(action: ActionType): void {
    const notification = NOTIFICATIONS[action];
    if (notification) {
      NotificationManager.show({
        message: notification.message,
        variant: notification.variant,
      });
    }
  }

  /**
   * Create library management buttons
   */
  protected createLibraryButtons(additionalClasses = ""): HTMLDivElement {
    const buttonsContainer = Create.div({
      id: "lib-container",
      className: `tw:flex tw:flex-col tw:p-4 tw:w-full tw:h-full tw:gap-4 ${additionalClasses}`,
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
   */
  protected handleButtonClick(e: Event): void {
    const target = e.target as HTMLButtonElement;
    if (target.tagName !== "BUTTON") return;

    const action = target.getAttribute("data-action") as ActionType;
    if (!action) return;

    const novelData = this.extractNovelDetails();
    this.handleNovelAction(novelData, action);
  }

  /**
   * Initialize the novel library management page
   */
  public abstract init(): Promise<void>;
}

/**
 * CenelNovel page manager implementation
 */
class CenelNovelPage extends NovelPageManager {
  protected selectors = {
    linksContainer: "#init-links",
    buttonsContainer: "#lib-container",
    followInfo: "#follow-info",
    novelTitle: ".post-title > h1:nth-child(1)",
    novelCover: ".summary_image > a:nth-child(1) > img:nth-child(1)",
    novelChapters: "li > ul > li > ul > li > a",
    novelDataContainer: "div.summary_content_wrap div.post-content",
  };

  /**
   * Create and append follow information to the page
   */
  private createFollowInfo(): void {
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
    infoTitle.innerHTML = "<h5>في المكتبة</h5>";

    const infoContent = Create.div({
      id: "follow-info",
      className: "summary-content",
    });

    infoContainer.appendChild(infoTitle);
    infoContainer.appendChild(infoContent);
    novelDataContainer.appendChild(infoContainer);

    this.infoContent = infoContent;
  }

  /**
   * Initialize the novel library management page
   */
  public async init(): Promise<void> {
    this.createFollowInfo();

    const linksContainer = document.querySelector(
      this.selectors.linksContainer
    );
    if (!linksContainer) return;

    this.buttonContainer = this.createLibraryButtons();
    linksContainer.appendChild(this.buttonContainer);
    this.buttonContainer.style.display = "none";

    await this.updateNovelStatus();
    this.buttonContainer.style.removeProperty("display");
  }
}

/**
 * KolNovel page manager implementation
 */
class KolNovelPage extends NovelPageManager {
  protected selectors = {
    novelTitle: "article > div.sertobig > div > div.sertoinfo > h1",
    novelCover: "article > div.sertobig > div > div.sertothumb > img",
    novelChapters: ".eplister > ul > li > a",
    novelDataContainer: "div.sertoinfo",
  };

  /**
   * Initialize the novel library management page
   */
  public async init(): Promise<void> {
    // Create follow info container
    this.infoContent = Create.div({
      className: "info-content",
      id: "follow-info",
    });

    const followContainer = Create.div({
      className:
        "follow-container tw:flex tw:flex-row tw:gap-4 tw:p-4 tw:flex-1",
      children: [
        Create.div({
          className: "follow-title",
          textContent: "الحالة",
        }),
        this.infoContent,
      ],
    });

    // Create button container
    this.buttonContainer = this.createLibraryButtons("tw:flex-1");
    this.buttonContainer.style.display = "none";

    // Create and append novel data container
    const novelDataContainer = Create.div({
      className: "tw:border-t tw:pt-5 tw:px-4 tw:flex tw:flex-col tw:gap-4",
      id: "novel-data-container",
      children: [followContainer, this.buttonContainer],
    });

    document
      .querySelector(this.selectors.novelDataContainer)
      ?.appendChild(novelDataContainer);

    await this.updateNovelStatus();
    this.buttonContainer.style.removeProperty("display");

    const novelImage = document.querySelector(
      " div.sertobig > div > div.sertothumb > img"
    ) as HTMLImageElement | null;

    const defaultImageUrl =
      "https://w.wallhaven.cc/full/ex/wallhaven-ex6pkk.jpg";
    const container = document.querySelector(" div.sertobig ") as HTMLElement;

    if (novelImage) {
      const src = novelImage.src;
      container.style.backgroundImage = `url(${src})`;
    } else {
      container.style.backgroundImage = `url(${defaultImageUrl})`;
    }
  }
}

// Export initialization functions
export async function cenelPageInit(): Promise<void> {
  const manager = new CenelNovelPage();
  await manager.init();
}

export async function kolnovelPageInit(): Promise<void> {
  const manager = new KolNovelPage();
  await manager.init();
}
