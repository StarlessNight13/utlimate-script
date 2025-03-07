import { cenelStyle, kolnovelStyle } from "@/lib/chapter/Styles";
import { cenelInit, kolnovelInit } from "../lib";
import {
  openCeneleSettings,
  openKolnovelSettings,
} from "../lib/chapter/openSettings";
import {
  appendCeneleToggle,
  appendKolnovelToggle,
} from "../lib/chapter/toggle-setting";
import {
  cenelDetectCurrentPage,
  kolnovelDetectCurrentPage,
} from "../lib/currentPage";
import { cenelLibraryInit, kolnovelLibraryInit } from "../lib/library/init";
import { cenelPageInit, kolnovelPageInit } from "@/pages/novel-page";

export type Pages = "chapter" | "page" | "home" | "user-library";

export const SITE_CONFIGS: Record<"cenele.com" | "kolbook.xyz", SiteConfig> = {
  "cenele.com": {
    selectors: {
      nextLink: ".next_page",
      contentContainer: ".text-left",
      appendTo: ".reading-content",
      title: "#chapter-heading",
      content: ".text-right",
      NovelBreadCrumb: " div.c-breadcrumb > ol > li:nth-child(2) > a",
    },
    currentPage: cenelDetectCurrentPage,
    chapterFuncs: {
      openSettingsFunc: openCeneleSettings,
      appendToggleFunc: appendCeneleToggle,
      chapterStyle: cenelStyle,
    },
    initNovelPage: cenelPageInit,
    initLibrary: cenelLibraryInit,
    initFunc: cenelInit,
    novelPath: "/cont/",
    libLink: "/my-account/#user-library",
  },
  "kolbook.xyz": {
    selectors: {
      nextLink:
        ".naveps > div:nth-child(1) > div:nth-child(1) > a:nth-child(1)",
      contentContainer: ".epwrapper",
      appendTo: ".epwrapper",
      title: ".cat-series",
      content: "#kol_content",
      NovelBreadCrumb:
        ".ts-breadcrumb > div:nth-child(1) > span:nth-child(2) > a:nth-child(1)",
    },
    currentPage: kolnovelDetectCurrentPage,
    chapterFuncs: {
      openSettingsFunc: openKolnovelSettings,
      appendToggleFunc: appendKolnovelToggle,
      chapterStyle: kolnovelStyle,
    },
    initNovelPage: kolnovelPageInit,
    initLibrary: kolnovelLibraryInit,
    initFunc: kolnovelInit,
    novelPath: "/series/",
    libLink: "/my-account/#user-library",
  },
};

export type SiteName = keyof typeof SITE_CONFIGS;

export interface SiteConfig {
  selectors: {
    nextLink: string;
    contentContainer: string;
    appendTo: string;
    title: string;
    content: string;
    NovelBreadCrumb: string;
  };
  libLink: string;
  currentPage: () => Pages;
  chapterFuncs: {
    openSettingsFunc: () => void;
    appendToggleFunc: (handleClick: (value: boolean) => void) => void;
    chapterStyle: (config: SiteConfig) => void;
  };
  initNovelPage: () => Promise<void>;
  initLibrary: (config: SiteConfig) => void;
  initFunc: () => void;
  novelPath: string;
}
