export interface TownNPC {
  id: string;
  name: string;
  dialogue: string;
  emoji?: string;
}

export interface ShopItem {
  id: string;
  type: "equipment" | "material";
  price: number;
}

export interface TownMaster {
  id: string;
  name: string;
  description: string;
  emoji: string;
  npcs: TownNPC[];
  shopItems: ShopItem[];
}
