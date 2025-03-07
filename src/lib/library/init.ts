import { NovelComponent } from "@/components/novelCard";
import { SiteConfig } from "@/config/site-config";
import { db } from "@/db";
import { cenelLibPage } from "./cenelLibPage";
import { Create } from "@/components/creat-element";

export async function cenelLibraryInit(config: SiteConfig) {
  // remove all element except the header
  const bodyWrapper = document.querySelector<HTMLDivElement>(".body-wrap");
  if (!bodyWrapper) return;

  Array.from(bodyWrapper.children).forEach((child) => {
    if (child.tagName !== "HEADER") {
      bodyWrapper.removeChild(child);
    }
  });

  const userSettings = cenelLibPage.createUserSettings();
  bodyWrapper.appendChild(userSettings);

  const novels = await db.novels.toArray();

  const novelGroups = {
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

  for (const [groupName, group] of Object.entries(novelGroups)) {
    if (group.novels.length === 0) {
      continue;
    }
    const groupContainer = Create.div({
      className:
        "tw:flex tw:flex-col tw:gap-4 tw:mb-4 tw:px-4 tw:border-t tw:pt-5",
    });
    bodyWrapper.appendChild(groupContainer);
    const groupHeader = document.createElement("h3");
    groupHeader.textContent = group.text;
    groupContainer.appendChild(groupHeader);
    const novelsContainer = Create.div({
      id: groupName,
      className: "novel-main-container",
    });
    groupContainer.appendChild(novelsContainer);

    group.novels.forEach((novel) => {
      new NovelComponent(groupName, novel, config.novelPath);
    });
  }
  cenelLibPage.setupEventListeners(novels);

  console.log("init library");
}

export async function kolnovelLibraryInit(config: SiteConfig) {
  // remove all element except the header
  const bodyWrapper = document.querySelector<HTMLDivElement>("#content");
  if (!bodyWrapper) return;

  Array.from(bodyWrapper.children).forEach((child) => {
    child.remove();
  });

  const userSettings = cenelLibPage.createUserSettings();
  bodyWrapper.appendChild(userSettings);
  bodyWrapper.classList.add("personal-library");

  const novels = await db.novels.toArray();

  const novelGroups = {
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

  for (const [groupName, group] of Object.entries(novelGroups)) {
    if (group.novels.length === 0) {
      continue;
    }
    const groupContainer = Create.div({
      className:
        "tw:flex tw:flex-col tw:gap-4 tw:mb-4 tw:px-4 tw:border-t tw:pt-5 ",
    });
    bodyWrapper.appendChild(groupContainer);
    const groupHeader = document.createElement("h3");
    groupHeader.className =
      "tw:scroll-m-20 tw:text-2xl tw:font-semibold tw:tracking-tight";
    groupHeader.textContent = group.text;
    groupContainer.appendChild(groupHeader);
    const novelsContainer = Create.div({
      className: "novel-main-container",
      id: groupName,
    });
    groupContainer.appendChild(novelsContainer);

    group.novels.forEach((novel) => {
      new NovelComponent(groupName, novel, config.novelPath);
    });
  }
  cenelLibPage.setupEventListeners(novels);

  console.log("init library");
}
