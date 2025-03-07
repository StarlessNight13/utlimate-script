import { NovelComponent } from "@/components/novelCard";
import { SiteConfig } from "@/config/site-config";
import { db } from "@/db";
import { Create } from "@/components/creat-element";
import { cenelLibPage } from "@/lib/library/cenelLibPage";

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
      text: "اقرأ حاليا",
      novels: novels.filter((novel) => novel.status === "reading"),
    },
    planToRead: {
      text: "قراءة مستقبلية",
      novels: novels.filter((novel) => novel.status === "planToRead"),
    },
    completed: {
      text: "أنهيت",
      novels: novels.filter((novel) => novel.status === "completed"),
    },
    dropped: {
      text: "سحبت عليها",
      novels: novels.filter((novel) => novel.status === "dropped"),
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

export function kolnovelLibraryInit() {
  console.log("init");
}
