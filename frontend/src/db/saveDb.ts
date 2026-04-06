import Dexie, { type Table } from "dexie";

/** IndexedDB の 1 レコード: key → JSON 文字列 */
export interface SaveEntry {
  key: string;
  value: string;
}

class SaveDatabase extends Dexie {
  saveData!: Table<SaveEntry>;

  constructor() {
    super("GuildOwnerRPG");
    this.version(1).stores({
      saveData: "key",
    });
    // version 2: スロット制導入。旧データ（プレフィックスなし）を slot1: へ移行
    this.version(2).stores({
      saveData: "key",
    }).upgrade(async (tx) => {
      const all: SaveEntry[] = await tx.table("saveData").toArray();
      const legacy = all.filter(({ key }) => !key.startsWith("slot"));
      if (legacy.length > 0) {
        const migrated = legacy.map(({ key, value }) => ({
          key: `slot1:${key}`,
          value,
        }));
        await tx.table("saveData").bulkPut(migrated);
        await tx.table("saveData").bulkDelete(legacy.map(({ key }) => key));
      }
    });
  }
}

export const db = new SaveDatabase();
