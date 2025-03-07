import { SiteConfig } from "@/config/site-config";
import { UNIVERSAL_CONFIG } from "@/config/universal-config";
import { ElementViewTracker } from "@/managers/ChapterObserver";
import { URLManager } from "@/managers/URLManager";

const getAutoLoaderState = (): boolean => {
  const localState = localStorage.getItem(UNIVERSAL_CONFIG.localStorageKey);

  if (!localState) {
    localStorage.setItem(UNIVERSAL_CONFIG.localStorageKey, "false");
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
  let elementViewTracker: ElementViewTracker | null = null;
  let urlManager: URLManager | null = null;

  const params = new URLSearchParams(window.location.search);

  if (params.get("autoLoaderDisabled") === "true") return;

  if (autoLoaderEnabled) {
    elementViewTracker = new ElementViewTracker(siteConfig);
    urlManager = new URLManager();
  }

  function handleClick(value: boolean) {
    if (value && !elementViewTracker && !urlManager) {
      elementViewTracker = new ElementViewTracker(siteConfig);
      urlManager = new URLManager();
    } else if (!value && elementViewTracker && urlManager) {
      elementViewTracker.destroy();
      urlManager.destroy();
      elementViewTracker = null;
      urlManager = null;
    }
  }

  siteConfig.chapterFuncs.appendToggleFunc(handleClick);
  siteConfig.chapterFuncs.chapterStyle(siteConfig);
}
