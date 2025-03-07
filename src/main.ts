import "./index.css";
import { NotificationManager } from "./components/Notification";
import { SITE_CONFIGS, type SiteName } from "./config/site-config";
import { UNIVERSAL_CONFIG } from "./config/universal-config";
import initChapter from "./pages/chapter";

// index.ts

(async function () {
  const hostname = window.location.hostname;
  if (!(hostname in SITE_CONFIGS)) {
    console.warn(`No site config found for hostname: ${hostname}`);
    return;
  }
  const config = SITE_CONFIGS[hostname as SiteName];

  const currentPage = config.currentPage();
  if (UNIVERSAL_CONFIG.debugMode) {
    console.log("Current page:", currentPage);
  }

  // --------
  config.initFunc();
  NotificationManager.init();

  if (currentPage === "chapter") {
    await initChapter(config);
  } else if (currentPage === "page") {
    await config.initNovelPage();
  } else if (currentPage === "user-library") {
    config.initLibrary(config);
  }
})();
