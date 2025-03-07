import { Create } from "@/components/creat-element";
import { SiteConfig } from "@/config/site-config";
import { DOMUtils } from "@/utils/dom";

// man... this is some reall garbage code ha...

export function processChapterContent(
  doc: Document,
  config: SiteConfig,
  url: string
): {
  title: string;
  nextChapterUrl: string | null;
  container: HTMLDivElement;
} {
  const containerElement = doc.querySelector<HTMLDivElement>(
    config.selectors.contentContainer
  );
  if (!containerElement) throw new Error("Content container not found");

  if (window.location.hostname === "kolbook.xyz") {
    const classesToRemove = DOMUtils.extractClassesFromStyle(
      doc,
      "article > style:nth-child(2)"
    );
    classesToRemove.forEach((className) => {
      containerElement
        .querySelectorAll(`.${className}`)
        .forEach((el) => el.remove());
    });
  }
  const contentElement = containerElement.querySelector(
    config.selectors.content
  ) as HTMLDivElement | null;
  if (!contentElement) throw new Error("Content element not found");

  const title =
    doc.querySelector(config.selectors.title)?.textContent || "Unknown Chapter";
  const nextChapterUrl =
    doc.querySelector<HTMLAnchorElement>(config.selectors.nextLink)?.href ??
    null;

  const container = Create.div({
    className: "chapter-container track-content",
    attributes: {
      "data-url": url,
      "data-chapter-title": title,
      "data-next-url": nextChapterUrl ?? "404",
    },
    children: [
      Create.div({
        className: "tw:w-full tw:h-px sentianl",
        attributes: {
          "data-url": url,
          "data-chapter-title": title,
          "data-next-url": nextChapterUrl ?? "404",
          "data-placement": "top",
        },
      }),
      ...Array.from(contentElement.children),
      Create.div({
        className: "tw:w-full tw:h-px sentianl",
        attributes: {
          "data-url": url,
          "data-chapter-title": title,
          "data-next-url": nextChapterUrl ?? "404",
          "data-placement": "middle",
        },
      }),
      Create.div({
        className: "tw:w-full tw:h-px sentianl",
        attributes: {
          "data-url": url,
          "data-chapter-title": title,
          "data-next-url": nextChapterUrl ?? "404",
          "data-placement": "bottom",
        },
      }),
    ],
  });

  Object.assign(container.style, {
    fontSize: "var(--font-size)",
    lineHeight: "var(--line-height)",
    fontFamily: "var(--font-family)",
  });

  return {
    title,
    nextChapterUrl,
    container,
  };
}
