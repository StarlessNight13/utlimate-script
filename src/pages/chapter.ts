import { SiteConfig } from "@/config/site-config";
import startChapterObserver from "@/managers/ChapterObserver";

const getAutoLoaderState = (): boolean => {
  const localState = localStorage.getItem("autoLoaderState");

  if (!localState) {
    localStorage.setItem("autoLoaderState", "false");
    return false;
  }

  return localState === "true";
};

const updateBodyClasses = (isEnabled: boolean): void => {
  if (isEnabled) {
    document.body.classList.add("removeELements");
  } else {
    document.body.classList.remove("removeELements");
  }
};

export default async function initChapter(siteConfig: SiteConfig) {
  const autoLoaderEnabled = getAutoLoaderState();
  updateBodyClasses(autoLoaderEnabled);

  const params = new URLSearchParams(window.location.search);

  if (params.get("autoLoaderDisabled") === "true") return;

  if (autoLoaderEnabled) await startChapterObserver(siteConfig);

  siteConfig.chapterFuncs.appendToggleFunc();
  siteConfig.chapterFuncs.chapterStyle(siteConfig);
}
