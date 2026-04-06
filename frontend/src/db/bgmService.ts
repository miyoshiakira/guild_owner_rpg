import { bgmDb } from "./bgmDb";

/** 指定トラックが IndexedDB にキャッシュされているか */
export async function isBgmCached(id: string): Promise<boolean> {
  return (await bgmDb.bgmCache.get(id)) !== undefined;
}

/**
 * 音源を fetch して IndexedDB にキャッシュする。
 * onProgress: 0〜1 の進捗コールバック（Content-Length が取れない場合は呼ばれない）
 */
export async function downloadAndCacheBgm(
  id: string,
  url: string,
  onProgress?: (pct: number) => void,
): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`BGM fetch failed: ${url} (${response.status})`);

  const contentLength = Number(response.headers.get("Content-Length") ?? 0);
  const reader = response.body!.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    if (contentLength > 0 && onProgress) {
      onProgress(received / contentLength);
    }
  }

  // chunks を 1 つの ArrayBuffer にまとめる
  const buffer = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    buffer.set(chunk, offset);
    offset += chunk.length;
  }

  await bgmDb.bgmCache.put({ id, data: buffer.buffer });
}

/** IndexedDB から音源 ArrayBuffer を取得する（未キャッシュは null） */
export async function getBgmBuffer(id: string): Promise<ArrayBuffer | null> {
  const entry = await bgmDb.bgmCache.get(id);
  return entry?.data ?? null;
}

/** 未キャッシュのトラック ID 一覧を返す */
export async function getMissingBgmIds(ids: string[]): Promise<string[]> {
  const missing: string[] = [];
  for (const id of ids) {
    if (!(await isBgmCached(id))) missing.push(id);
  }
  return missing;
}
