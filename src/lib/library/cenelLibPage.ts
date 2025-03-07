import { Create } from "@/components/creat-element";
import { NotificationManager } from "@/components/Notification";
import { Novels } from "@/db";
import { compareNovelData } from "@/utils/compare";
import fetchNovel from "@/utils/fetchNovel";
import { Bot, createElement, RefreshCcw } from "lucide";

type NovelData = {
  name: string;
  cover: string;
  novelChapters: number;
  uri: string;
  id: number;
};

export const cenelLibPage = {
  createUserSettings: (): HTMLDivElement => {
    const userSettings = Create.div({
      className: "tw:flex tw:flex-col tw:p-4 tw:px-6",
    });
    const userSettingsContent = Create.div({
      className: "tw:flex tw:flex-col",
    });
    userSettings.appendChild(userSettingsContent);

    const userSettingsHeader = document.createElement("h3");
    userSettingsHeader.textContent = "اعدادت";
    userSettingsContent.appendChild(userSettingsHeader);

    const userSettingsContainer = Create.div({
      className:
        "tw:flex tw:flex-col tw:justify-between tw:gap-4 tw:mb-4 tw:md:flex-row",
    });
    userSettingsContent.appendChild(userSettingsContainer);

    const userSettingsItem = Create.div({
      className: "tw:flex tw:items-center tw:gap-2 tw:rounded tw:px-4 tw:py-2",
    });
    userSettingsContainer.appendChild(userSettingsItem);

    const userSettingsItemInput = document.createElement("input");
    userSettingsItemInput.type = "checkbox";
    userSettingsItemInput.className = "tw:hidden";
    userSettingsItemInput.id = "auto-loader-toggle";
    userSettingsItem.appendChild(userSettingsItemInput);

    const savedSetting = localStorage.getItem("autoLoaderState");
    if (savedSetting) {
      userSettingsItemInput.checked = true;
    } else {
      localStorage.setItem("autoLoaderState", "false");
    }
    userSettingsItemInput.addEventListener("change", (e) => {
      const target = e.target as HTMLInputElement;
      const autoLoaderState = target.checked;
      localStorage.setItem("autoLoaderState", String(autoLoaderState));
    });

    const userSettingsItemLabel = document.createElement("label");
    userSettingsItemLabel.htmlFor = "auto-loader-toggle";
    userSettingsItemLabel.textContent = "ألمحمل التلقائي";
    userSettingsItemLabel.className = "endless-toggle ";
    const bot = createElement(Bot);
    userSettingsItemLabel.appendChild(bot);
    userSettingsItem.appendChild(userSettingsItemLabel);

    const syncButton = Create.endlessButton({
      id: "sync-btn",
      textContent: "البحث عن الفصول الجديدة",
      children: createElement(RefreshCcw),
    });
    const syncSettingsItem = userSettingsItem.cloneNode(false);
    syncSettingsItem.appendChild(syncButton);
    userSettingsContainer.appendChild(syncSettingsItem);

    return userSettings;
  },

  updateNovels: async (novels: Novels[]): Promise<NovelData[]> => {
    const baseUrl = "https://cenele.com/cont/";

    const promises = novels.map(async (novel) => {
      const res = await fetchNovel(baseUrl + novel.uri);
      return {
        ...res,
        uri: novel.uri,
        id: novel.id,
      };
    });

    return await Promise.all(promises);
  },

  setupEventListeners: (novels: Novels[]): void => {
    const syncButton = document.querySelector<HTMLDivElement>("#sync-btn");

    syncButton?.addEventListener("click", async () => {
      try {
        // updatedNovels now contains only the successfully updated novel data
        const updatedNovels = await cenelLibPage.updateNovels(novels);
        const { noUpdates, updates } = compareNovelData(novels, updatedNovels);
        console.log("No updates:", noUpdates);
        console.log("Updates:", updates);
        console.log("Original novels:", novels);
        console.log("Updated novels:", updatedNovels);
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
      }
    });
  },
};
