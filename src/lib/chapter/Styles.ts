// Kolnovel style function
export function kolnovelStyle() {
  // --- Default Chapter Style Configuration ---
  const DEFAULT_CHAPTER_STYLE_CONFIG = {
    fontSize: "16px",
    fontFamily: "'Noto Kufi Arabic', sans-serif",
    lineHeight: "200%",
  };

  // --- Load Chapter Style from Local Storage ---
  const localStorageStyleKey = "ts_rs_cfg";
  let currentChapterStyleConfig = DEFAULT_CHAPTER_STYLE_CONFIG; // Default style
  const storedStyleConfig = localStorage.getItem(localStorageStyleKey);
  const epWrapper = document.querySelector<HTMLDivElement>(".epwrapper");

  const selectors = document.querySelectorAll(".optxshd .optx-group  select");

  selectors.forEach((selector) => {
    selector.addEventListener("change", (e) => {
      const target = e.target as HTMLSelectElement;
      const changedSetting = target.id;
      if (changedSetting === "option-font-size") {
        epWrapper?.style.setProperty(
          "--font-size",
          target.options[target.selectedIndex].value
        );
      }
      if (changedSetting === "option-font-family") {
        epWrapper?.style.setProperty(
          "--font-family",
          target.options[target.selectedIndex].value
        );
      }
      if (changedSetting === "option-line-height") {
        epWrapper?.style.setProperty(
          "--line-height",
          target.options[target.selectedIndex].value
        );
      }
    });
  });

  if (storedStyleConfig) {
    try {
      currentChapterStyleConfig = JSON.parse(storedStyleConfig);
    } catch (e) {
      console.error("Error parsing stored style config, using default:", e);
      currentChapterStyleConfig = DEFAULT_CHAPTER_STYLE_CONFIG; // Fallback to default on parse error
    }
    epWrapper?.style.setProperty(
      "--font-size",
      `${currentChapterStyleConfig.fontSize}`
    );
    epWrapper?.style.setProperty(
      "--font-family",
      currentChapterStyleConfig.fontFamily
    );
    epWrapper?.style.setProperty(
      "--line-height",
      currentChapterStyleConfig.lineHeight
    );
  } else {
    console.log("No stored style config found, using default.");
  }
}

export function cenelStyle() {
  // 1. Type Definitions and Constants: Grouped at the top for clarity and maintainability.
  /**
   * @typedef {Object} ChapterStyle - Defines the style properties for a chapter.
   * @property {string} fontSize
   * @property {string} lineHeight
   */
  type ChapterStyle = Record<string, string>;

  const DEFAULT_STYLE: ChapterStyle = {
    fontSize: "19px",
    lineHeight: "28.5px",
  } as const;

  const DOM_SELECTORS = {
    content: ".reading-content",
    chapter: ".text-left",
    sizeButtons: ".theme-set-size > i",
  } as const;

  /**
   * @typedef {Object} DOMElements - Represents the DOM elements used in cenelStyle.
   * @property {HTMLDivElement | null} chapter
   * @property {HTMLDivElement | null} content
   * @property {NodeListOf<HTMLElement> | null} sizeButtons
   */
  interface DOMElements {
    chapter: HTMLDivElement | null;
    content: HTMLDivElement | null;
    sizeButtons: NodeListOf<HTMLElement> | null;
  }

  // 2. DOM Element Retrieval: Encapsulated for better organization.
  /**
   * Retrieves relevant DOM elements based on predefined selectors.
   * @returns {DOMElements} An object containing the chapter, content, and sizeButtons elements.
   */
  function getReadingElements(): DOMElements {
    return {
      chapter: document.querySelector<HTMLDivElement>(DOM_SELECTORS.chapter),
      content: document.querySelector<HTMLDivElement>(DOM_SELECTORS.content),
      sizeButtons: document.querySelectorAll(DOM_SELECTORS.sizeButtons),
    };
  }

  // 3. Style Management Functions: Focused and reusable style logic.
  /**
   * Extracts the current font size and line height styles from the chapter element.
   * Returns the default style if the chapter element is not available.
   * @param {HTMLDivElement | null} chapter - The chapter element.
   * @returns {ChapterStyle} An object containing the current or default chapter style.
   */
  function extractChapterStyle(chapter: HTMLDivElement | null): ChapterStyle {
    if (!chapter) {
      return DEFAULT_STYLE;
    }
    const fontSize = chapter.style.fontSize;
    const lineHeight = chapter.style.lineHeight;
    return {
      fontSize: fontSize || DEFAULT_STYLE.fontSize,
      lineHeight: lineHeight || DEFAULT_STYLE.lineHeight,
    };
  }

  /**
   * Applies a given style object to the content element by setting CSS custom properties.
   * @param {HTMLDivElement | null} content - The content element to style.
   * @param {ChapterStyle} style - An object containing style properties (fontSize, lineHeight).
   */
  function applyContentStyle(
    content: HTMLDivElement | null,
    style: ChapterStyle
  ): void {
    if (!content) return; // Exit if content element is not available.

    for (const [variableName, value] of Object.entries(style)) {
      content.style.setProperty(`--${variableName}`, value);
    }
  }

  // 4. Event Handling Setup: Separated for clarity.
  /**
   * Attaches event listeners to the size buttons to update the content style on click.
   * @param {NodeListOf<HTMLElement> | null} sizeButtons - Buttons to adjust text size.
   * @param {HTMLDivElement | null} content - The content element to style.
   * @param {HTMLDivElement | null} chapter - The chapter element to get style from.
   */
  function setupSizeButtonEvents(
    sizeButtons: NodeListOf<HTMLElement> | null,
    content: HTMLDivElement | null,
    chapter: HTMLDivElement | null
  ): void {
    if (!sizeButtons) return; // Exit if sizeButtons are not available.

    Array.from(sizeButtons).forEach((button) => {
      button.addEventListener("click", () => {
        const currentChapterStyle = extractChapterStyle(chapter);
        applyContentStyle(content, currentChapterStyle);
      });
    });
  }

  // 5. Initialization and Default Styling: Main execution logic.
  /**
   * Initializes the cenelStyle functionality: retrieves elements, applies default style if necessary, and sets up event listeners.
   */
  function initializeCenelStyle(): void {
    const { chapter, content, sizeButtons } = getReadingElements();

    if (!chapter || !sizeButtons) {
      applyContentStyle(content, DEFAULT_STYLE);
      return; // Exit early if essential elements are missing and default style is applied.
    }

    setupSizeButtonEvents(sizeButtons, content, chapter);
    applyContentStyle(content, extractChapterStyle(chapter)); // Apply initial style
  }

  initializeCenelStyle(); // Execute initialization

  // 6. Return Value (Optional but potentially useful for external access):
  return {
    fontSize: "var(--fontSize)",
    lineHeight: "var(--lineHeight)",
  };
}
