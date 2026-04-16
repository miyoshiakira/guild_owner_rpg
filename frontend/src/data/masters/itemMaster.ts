import type { ItemType } from "../../types/game";
import itemsJson from './json/items.json';

/** 消耗品・アイテムのテンプレート定義（個数は initData / ゲーム内で管理） */
export interface ItemTemplate {
  id: string;
  name: string;
  type: ItemType;
  effect: string;
  sprite: string;
}

export const ITEM_MASTER: ItemTemplate[] = itemsJson as ItemTemplate[];

export const ITEM_MAP: Record<string, ItemTemplate> = Object.fromEntries(
  ITEM_MASTER.map((i) => [i.id, i])
);