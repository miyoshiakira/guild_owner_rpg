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
      saveData: "key", // key を主キーとした KV ストア
    });
  }
}

export const db = new SaveDatabase();
