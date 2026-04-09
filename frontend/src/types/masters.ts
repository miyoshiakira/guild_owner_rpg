import type { MonsterType, EquipSlot, ItemType, DropEntry } from "./game";

export type ElementType = MonsterType;

// ===== 素材アイテム =====
export interface MaterialItem {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

// ===== モンスターマスタ（Enemy + ドロップ定義） =====
export interface EnemyMaster {
  id: string;
  name: string;
  type: MonsterType;
  race: string;         // 種族
  level: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  atk: number;
  def: number;
  spd: number;
  sprite: string;
  reward: { exp: number; gold: number };
  catchRate: number;
  drops: DropEntry[];
  skills: string[];
  personality: string;
}

// ===== クラフトレシピ =====
export interface CraftIngredient {
  materialId: string;
  qty: number;
}

export interface CraftResultEquipment {
  type: "equipment";
  name: string;
  slot: EquipSlot;
  effect: string;
  atkBonus: number;
  defBonus: number;
  spdBonus: number;
  sprite: string;
  element?: MonsterType;
}

export interface CraftResultItem {
  type: "item";
  id: string;
  name: string;
  itemType: ItemType;
  effect: string;
  sprite: string;
}

export type CraftResult = CraftResultEquipment | CraftResultItem;

// ===== スキルマスタ =====
export interface SkillMaster {
  id: string;
  name: string;
  power: number;         // 威力（0 = ダメージなし / 状態異常・補助）
  description: string;   // 説明文
  mpCost: number;        // 消費MP
  element?: MonsterType; // 属性 (なしは無属性物理)
  target?: "all";        // 全体攻撃フラグ
}

export interface CraftRecipe {
  id: string;
  name: string;
  description: string;
  emoji: string;
  ingredients: CraftIngredient[];
  result: CraftResult;
  resultQty: number;
}

// ===== NPCマスタ（ストーリー用） =====
export interface StoryNPC {
  id: string;
  name: string;
  description: string;
  emoji: string;
  mapId: string;              // 出現マップID
  position: { row: number; col: number }; // マップ上の位置
  dialogues: {
    condition?: { flag: string; value: boolean }; // 条件（ストーリーフラグ）
    text: string;             // セリフ
  }[];
}

// ===== イベントマスタ =====
export type EventType = "battle" | "conversation";

export interface EventCondition {
  type: "flag" | "level" | "item" | "map_visit";
  flag?: string;              // フラグ名
  value?: boolean | number;   // 期待値
  itemId?: string;            // アイテムID（所持チェック用）
  mapId?: string;             // マップID（訪問チェック用）
}

export interface EventReward {
  type: "item" | "equipment" | "gold" | "exp" | "flag";
  itemId?: string;            // アイテム/装備品ID
  quantity?: number;          // 数量
  gold?: number;              // ゴールド
  exp?: number;               // 経験値
  flag?: string;              // 設定するフラグ名
}

export interface BattleEvent {
  type: "battle";
  enemyIds: string[];         // 出現する敵IDリスト
  winRewards: EventReward[];  // 勝利報酬
  loseRewards?: EventReward[]; // 敗北報酬
}

export interface ConversationEvent {
  type: "conversation";
  npcId: string;              // 会話相手のNPC ID
  dialogue: string;           // 会話内容
  choices?: Array<{
    text: string;             // 選択肢テキスト
    nextEventId?: string;     // 選択後のイベントID
    rewards?: EventReward[];  // 選択時の報酬
  }>;
}

export type EventData = BattleEvent | ConversationEvent;

export interface StoryEvent {
  id: string;
  name: string;
  description: string;
  chapter: number;            // 所属する章
  mapId: string;              // 発生マップID
  position: { row: number; col: number }; // マップ上の位置
  trigger: "step" | "interact"; // トリガータイプ（踏む/話す）
  prerequisites?: string[];   // 前提フラグ（これらのフラグが立っていないと非表示）
  conditions: EventCondition[]; // 発生条件
  data: EventData;            // イベントデータ
  repeatable: boolean;        // 繰り返し可能か
  nextEventId?: string;       // 完了後の次のイベントID
}
