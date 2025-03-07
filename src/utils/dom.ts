export const DOMUtils = {
  removeElements: (doc: Document, selectors: string[]): void => {
    selectors.forEach((selector) => {
      doc.querySelectorAll(selector).forEach((element) => element.remove());
    });
  },

  getNextChapterUrl: (doc: Document, selector: string): string | null => {
    const nextLink = doc.querySelector<HTMLAnchorElement>(selector);
    return nextLink?.href || null;
  },

  extractClassesFromStyle: (doc: Document, selector: string): string[] => {
    const styleElement = doc.querySelector(selector);
    if (!styleElement) return [];

    const cssText = styleElement.textContent || "";
    const classNames = new Set<string>();
    const regex = /\.([a-zA-Z_][a-zA-Z0-9_-]*)/g;
    let match;

    while ((match = regex.exec(cssText))) {
      classNames.add(match[1]);
    }

    return Array.from(classNames);
  },
};
