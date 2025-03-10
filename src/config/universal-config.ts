export interface UniversalConfig {
  scrollThreshold: number;
  maxVisibleChapters: number;
  initDelay: number;
  urlUpdateThreshold: number;
  debugMode: boolean;
  localStorageKey: string;
}

export const UNIVERSAL_CONFIG: UniversalConfig = {
  scrollThreshold: 900,
  maxVisibleChapters: 2,
  initDelay: 2000,
  urlUpdateThreshold: 10,
  debugMode: true,
  localStorageKey: "autoLoaderState",
} as const;
