import type { Novels } from "../db";

type NovelData = {
  name: string;
  cover: string;
  novelChapters: number;
  uri: string;
  id: number;
};

export function compareNovelData(oldData: Novels[], newData: NovelData[]) {
  const noUpdates: Novels[] = [];
  const updates: Novels[] = [];
  oldData.forEach((oldNovel) => {
    const newNovel = newData.find((newNovel) => newNovel.uri === oldNovel.uri);
    if (newNovel) {
      if (newNovel.novelChapters !== oldNovel.novelChapters) {
        updates.push({
          ...oldNovel,
          ...newNovel,
        });
      } else {
        noUpdates.push({
          ...oldNovel,
          ...newNovel,
        });
      }
    } else {
      noUpdates.push(oldNovel);
    }
  });
  return { noUpdates, updates };
}
