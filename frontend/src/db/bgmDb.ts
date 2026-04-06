import Dexie, { type Table } from "dexie";

/** 音源キャッシュの 1 レコード */
export interface BgmCacheEntry {
  id: string;        // トラック名 (例: "草原1")
  data: ArrayBuffer;
}

class BgmDatabase extends Dexie {
  bgmCache!: Table<BgmCacheEntry>;

  constructor() {
    super("GuildOwnerRPG_BGM");
    this.version(1).stores({
      bgmCache: "id",
    });
  }
}

export const bgmDb = new BgmDatabase();
