import { NovelComponent } from "@/components/novelCard";
import { SiteConfig } from "@/config/site-config";
import { db, Novels } from "@/db";
import { NotificationManager } from "@/components/Notification";
import { compareNovelData } from "@/utils/compare";
import fetchNovel from "@/utils/fetchNovel";
import { Bot, createElement, RefreshCcw } from "lucide";
import { Create } from "@/components/creat-element";
import { UNIVERSAL_CONFIG } from "@/config/universal-config";

interface NovelData {
  name: string;
  cover: string;
  novelChapters: number;
  uri: string;
  id: number;
}

interface NovelGroup {
  text: string;
  novels: Novels[];
}

interface NovelGroups {
  [key: string]: NovelGroup;
}

class UserSettingsManager {
  private static readonly BASE_URL = "https://cenele.com/cont/";

  /**
   * Creates the user settings UI components
   */
  static createUserSettings(): HTMLDivElement {
    const userSettings = Create.div({
      className: "tw:flex tw:flex-col tw:p-4 tw:px-6",
    });
    const userSettingsContent = Create.div({
      className: "tw:flex tw:flex-col",
    });
    userSettings.appendChild(userSettingsContent);

    // Add header
    const userSettingsHeader = document.createElement("h3");
    userSettingsHeader.textContent = "اعدادت";
    userSettingsContent.appendChild(userSettingsHeader);

    // Create settings container
    const userSettingsContainer = Create.div({
      className:
        "tw:flex tw:flex-col tw:justify-between tw:gap-4 tw:mb-4 tw:md:flex-row",
    });
    userSettingsContent.appendChild(userSettingsContainer);

    // Add auto-loader toggle
    userSettingsContainer.appendChild(this.createAutoLoaderToggle());

    // Add sync button
    userSettingsContainer.appendChild(this.createSyncButton());

    return userSettings;
  }

  /**
   * Creates the auto-loader toggle UI component
   */
  private static createAutoLoaderToggle(): HTMLDivElement {
    const userSettingsItem = Create.div({
      className: "tw:flex tw:items-center tw:gap-2 tw:rounded tw:px-4 tw:py-2",
    });

    const userSettingsItemInput = document.createElement("input");
    userSettingsItemInput.type = "checkbox";
    userSettingsItemInput.className = "tw:hidden";
    userSettingsItemInput.id = "auto-loader-toggle";
    userSettingsItem.appendChild(userSettingsItemInput);

    // Load saved setting
    const savedSetting = localStorage.getItem(UNIVERSAL_CONFIG.localStorageKey);
    if (savedSetting === "true") {
      userSettingsItemInput.checked = true;
    } else {
      localStorage.setItem(UNIVERSAL_CONFIG.localStorageKey, "false");
    }

    // Add change event listener
    userSettingsItemInput.addEventListener("change", (e) => {
      const target = e.target as HTMLInputElement;
      localStorage.setItem(
        UNIVERSAL_CONFIG.localStorageKey,
        String(target.checked)
      );
    });

    const userSettingsItemLabel = document.createElement("label");
    userSettingsItemLabel.htmlFor = "auto-loader-toggle";
    userSettingsItemLabel.textContent = "ألمحمل التلقائي";
    userSettingsItemLabel.className = "endless-toggle ";
    userSettingsItemLabel.appendChild(createElement(Bot));
    userSettingsItem.appendChild(userSettingsItemLabel);

    return userSettingsItem;
  }

  /**
   * Creates the sync button UI component
   */
  private static createSyncButton(): HTMLDivElement {
    const syncButton = Create.endlessButton({
      id: "sync-btn",
      textContent: "البحث عن الفصول الجديدة",
      children: createElement(RefreshCcw),
    });

    const syncSettingsItem = Create.div({
      className: "tw:flex tw:items-center tw:gap-2 tw:rounded tw:px-4 tw:py-2",
    });
    syncSettingsItem.appendChild(syncButton);

    return syncSettingsItem;
  }

  /**
   * Updates novel data by fetching the latest information
   */
  static async updateNovels(novels: Novels[]): Promise<NovelData[]> {
    const promises = novels.map(async (novel) => {
      const res = await fetchNovel(this.BASE_URL + novel.uri);
      return {
        ...res,
        uri: novel.uri,
        id: novel.id,
      };
    });

    return await Promise.all(promises);
  }

  /**
   * Sets up event listeners for user interactions
   */
  static setupEventListeners(novels: Novels[]): void {
    const syncButton = document.querySelector<HTMLDivElement>("#sync-btn");

    syncButton?.addEventListener("click", async () => {
      try {
        const updatedNovels = await this.updateNovels(novels);
        const { noUpdates, updates } = compareNovelData(novels, updatedNovels);

        if (updates.length > 0) {
          NotificationManager.show({
            message: `Successfully updated ${updates.length} novels`,
          });
        } else if (noUpdates.length > 0) {
          NotificationManager.show({
            message: `No updates found for ${noUpdates.length} novels`,
          });
        }
      } catch (error) {
        console.error("Failed to update novels:", error);
        NotificationManager.show({
          message: "Failed to update novels. Please try again later.",
        });
      }
    });
  }
}

class LibraryManager {
  /**
   * Organizes novels into groups based on their status
   */
  static async getNovelGroups(): Promise<NovelGroups> {
    const novels = await db.novels.toArray();

    return {
      reading: {
        text: "Reading",
        novels: novels.filter((novel) => novel.status === "reading"),
      },
      completed: {
        text: "Completed",
        novels: novels.filter((novel) => novel.status === "completed"),
      },
      dropped: {
        text: "Dropped",
        novels: novels.filter((novel) => novel.status === "dropped"),
      },
      planToRead: {
        text: "Plan to read",
        novels: novels.filter((novel) => novel.status === "planToRead"),
      },
    };
  }

  /**
   * Renders novel groups in the UI
   */
  static renderNovelGroups(
    container: HTMLElement,
    novelGroups: NovelGroups,
    novelPath: string
  ): void {
    for (const [groupName, group] of Object.entries(novelGroups)) {
      if (group.novels.length === 0) {
        continue;
      }

      // Create group container
      const groupContainer = Create.div({
        className:
          "tw:flex tw:flex-col tw:gap-4 tw:mb-4 tw:px-4 tw:border-t tw:pt-5",
      });
      container.appendChild(groupContainer);

      // Add group header
      const groupHeader = document.createElement("h3");
      groupHeader.textContent = group.text;
      groupHeader.className =
        "tw:scroll-m-20 tw:text-2xl tw:font-semibold tw:tracking-tight";
      groupContainer.appendChild(groupHeader);

      // Create novels container
      const novelsContainer = Create.div({
        id: groupName,
        className: "novel-main-container",
      });
      groupContainer.appendChild(novelsContainer);

      // Render each novel in the group
      group.novels.forEach((novel) => {
        new NovelComponent(groupName, novel, novelPath);
      });
    }
  }

  /**
   * Clears all child elements except header
   */
  static clearContainer(
    container: HTMLElement,
    preserveHeader: boolean = false
  ): void {
    Array.from(container.children).forEach((child) => {
      if (!preserveHeader || child.tagName !== "HEADER") {
        child.remove();
      }
    });
  }
}

/**
 * Initialize library for Cenele site
 */
export async function cenelLibraryInit(config: SiteConfig): Promise<void> {
  const bodyWrapper = document.querySelector<HTMLDivElement>(".body-wrap");
  if (!bodyWrapper) return;

  // Clear existing content
  LibraryManager.clearContainer(bodyWrapper, true);

  // Add user settings
  const userSettings = UserSettingsManager.createUserSettings();
  bodyWrapper.appendChild(userSettings);

  // Get and render novel groups
  const novelGroups = await LibraryManager.getNovelGroups();
  LibraryManager.renderNovelGroups(bodyWrapper, novelGroups, config.novelPath);

  // Setup event listeners
  const novels = await db.novels.toArray();
  UserSettingsManager.setupEventListeners(novels);

  console.log("Cenele library initialized");
}

/**
 * Initialize library for Kolnovel site
 */
export async function kolnovelLibraryInit(config: SiteConfig): Promise<void> {
  const bodyWrapper = document.querySelector<HTMLDivElement>("#content");
  if (!bodyWrapper) return;

  // Clear existing content
  LibraryManager.clearContainer(bodyWrapper);
  bodyWrapper.classList.add("personal-library");

  // Add user settings
  const userSettings = UserSettingsManager.createUserSettings();
  bodyWrapper.appendChild(userSettings);

  // Get and render novel groups
  const novelGroups = await LibraryManager.getNovelGroups();
  LibraryManager.renderNovelGroups(bodyWrapper, novelGroups, config.novelPath);

  // Setup event listeners
  const novels = await db.novels.toArray();
  UserSettingsManager.setupEventListeners(novels);

  console.log("Kolnovel library initialized");
}
