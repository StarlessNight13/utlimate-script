type NovelData = {
  name: string;
  cover: string;
  novelChapters: number;
};

export default async function fetchNovel(url: string): Promise<NovelData> {
  const response = await fetch(url);
  const data = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(data, "text/html");

  const novelName = doc
    .querySelector<HTMLHeadingElement>(".post-title > h1:nth-child(1)")
    ?.textContent?.trim();
  const novelCover = doc.querySelector<HTMLImageElement>(
    ".summary_image > a:nth-child(1) > img:nth-child(1)"
  )?.src;
  const chapterEmelents = doc.querySelectorAll(
    "li > ul > li > ul > li > a"
  ) as NodeListOf<HTMLAnchorElement>;

  return {
    name: novelName ?? "unkown",
    cover: novelCover ?? "#",
    novelChapters: chapterEmelents.length,
  };
}
