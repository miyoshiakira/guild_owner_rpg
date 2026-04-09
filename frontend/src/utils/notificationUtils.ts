import { ITEM_MAP } from "../data/masters/itemMaster";
import { EQUIPMENT_MAP } from "../data/masters/equipmentMaster";

export interface NotificationReward {
  type: "gold" | "exp" | "flag" | "equipment" | "item";
  gold?: number;
  exp?: number;
  flag?: string;
  itemId?: string;
  quantity?: number;
}

export function getRewardMessage(reward: NotificationReward): string {
  switch (reward.type) {
    case "gold":
      return `${reward.gold}ゴールド獲得！`;
    case "exp":
      return `${reward.exp}経験値獲得！`;
    case "flag":
      return `フラグ設定: ${reward.flag}`;
    case "equipment":
      const equipment = EQUIPMENT_MAP[reward.itemId!];
      return `装備品獲得: ${equipment?.name ?? reward.itemId}`;
    case "item":
      const item = ITEM_MAP[reward.itemId!];
      return `アイテム獲得: ${item?.name ?? reward.itemId}`;
    default:
      return "";
  }
}

export function getCraftRewardMessage(itemName: string, type: "equipment" | "item"): string {
  const resultType = type === "equipment" ? "装備品" : "アイテム";
  return `${resultType}獲得: ${itemName}`;
}
