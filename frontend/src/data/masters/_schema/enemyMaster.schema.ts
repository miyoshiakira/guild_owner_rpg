/**
 * ════════════════════════════════════════════════════════════════════
 * ENEMY MASTER — 新規追加用スキーマ定義ファイル
 *
 * 【Claudeへの指示】
 *   このファイルを読んで _pending/enemy.pending.ts に新規エントリを書いてください。
 *   実データ (enemyMaster.ts) は読まなくて構いません。
 *
 * 【次に使うID】
 *   e-076
 *
 * 【マージ方法】
 *   node scripts/mergeMaster.mjs enemy
 * ════════════════════════════════════════════════════════════════════
 */

// ── 型定義 ────────────────────────────────────────────────────────────

interface EnemyEntry {
  id: string;           // "e-NNN" 形式 (3桁ゼロ埋め)
  name: string;         // モンスター名 (画像ファイル名の元にもなる)
  type: MonsterType;    // 属性 → 下記 VALID_TYPES 参照
  race: string;         // 種族 → 下記 VALID_RACES 参照
  level: number;        // 基準レベル(1固定推奨。実際はマップスケーリングで変化)
  hp: number;           // HP (hp === maxHp で設定)
  maxHp: number;
  mp: number;           // MP (mp === maxMp で設定)
  maxMp: number;
  atk: number;          // 攻撃力
  def: number;          // 防御力
  spd: number;          // 素早さ
  sprite: string;       // "{name}.png" 形式。画像ファイルが src/data/image/ に存在すること
  reward: {
    exp: number;        // 撃破時の経験値
    gold: number;       // 撃破時のゴールド
  };
  catchRate: number;    // 捕獲率 0.0〜1.0 (雑魚=0.2〜0.3, レア=0.05〜0.1)
  personality: string;  // 性格 → 下記 VALID_PERSONALITIES 参照
  skills: string[];     // スキル名リスト → 下記 VALID_SKILLS 参照
  drops: DropEntry[];   // ドロップアイテム
}

interface DropEntry {
  materialId: string;   // "mat-NNN" 形式 → materialMaster.ts 参照
  rate: number;         // ドロップ率 0.0〜1.0
  minQty: number;       // 最小ドロップ数
  maxQty: number;       // 最大ドロップ数
}

// ── 有効な値一覧 ───────────────────────────────────────────────────────

type MonsterType = "水" | "地" | "光" | "炎" | "闇";

const VALID_RACES = [
  "スライム族", "水棲族", "獣族", "不死族", "悪魔族",
  "人型族", "植物族", "岩石族", "鳥族", "竜族",
  "虫族", "魚人族", "エレメント族", "機械族", "神族",
] as const;

const VALID_PERSONALITIES = [
  "のんき", "いじっぱり", "おくびょう", "ずるがしこい",
  "むこうみず", "れいせい", "ゆうかん", "なまいき",
] as const;

const VALID_SKILLS = [
  // 物理
  "たいあたり", "つっこみ", "はねまわる", "かみつき",
  "れんぞくひっかき", "ずつき", "ひっかき",
  // 魔法・属性
  "みずしぶき", "ウォーターボール", "ウォーターバースト",
  "ファイアボール", "ファイアストーム", "かえんほうしゃ",
  "アイスアロー", "アイスストーム", "れいとうブレス",
  "いかずち", "サンダーボルト",
  "シャドウボール", "ダークウェーブ", "カースブレス",
  "ホーリーライト", "せいなるひかり",
  // 全体攻撃
  "地響き", "猛毒霧", "嵐の爪", "黒い霧",
  // 補助
  "ちからため", "こうそくいどう", "かいふく",
] as const;

const VALID_MATERIAL_IDS = [
  "mat-001", // スライムゼリー
  "mat-002", // スライムコア
  "mat-003", // 獣の毛皮
  "mat-004", // 硬い骨
  "mat-005", // 魔法の粉
  "mat-006", // 魔力の結晶
  "mat-007", // ゴブリンの牙
  "mat-008", // 骨片
  "mat-009", // 炎の結晶
  "mat-010", // 氷の欠片
  "mat-011", // 悪魔の角
  "mat-012", // 鱗
  "mat-013", // 鉄の欠片
  "mat-014", // 竜の牙
  "mat-015", // 毒の牙
  "mat-016", // 炎の鱗
  "mat-017", // 獣の爪
  "mat-018", // 柔らかい毛皮
  "mat-019", // 羽根
  "mat-020", // 甲羅片
  "mat-021", // 毒液
  "mat-022", // 深海の宝珠
  "mat-023", // 黄金の欠片
  "mat-024", // 魔王の角
  "mat-025", // 天使の羽
  "mat-026", // 竜の鱗
  "mat-027", // 氷晶石
  "mat-028", // 炎玉
  "mat-029", // 深海珊瑚
  "mat-030", // 聖光石
  "mat-031", // 魔神の結晶
  "mat-032", // 古代の宝珠
  "mat-033", // 神聖氷晶石
] as const;

// ── ステータス目安 ─────────────────────────────────────────────────────
//  Lv1雑魚:  hp 10-20,  atk 3-8,   def 2-6,   spd 4-10
//  Lv1中堅:  hp 25-50,  atk 8-15,  def 6-12,  spd 6-14
//  Lv1強敵:  hp 60-100, atk 16-25, def 12-20, spd 10-18
//  reward.exp / gold は hp の 0.6〜1.2 倍程度を目安に

// ── 記述例 ────────────────────────────────────────────────────────────
/*
  {
    id: "e-076",
    name: "サンドワーム",
    type: "地",
    race: "虫族",
    level: 1,
    hp: 28, maxHp: 28, mp: 0, maxMp: 0,
    atk: 10, def: 8, spd: 5,
    sprite: "サンドワーム.png",
    reward: { exp: 22, gold: 18 },
    catchRate: 0.2,
    personality: "むこうみず",
    skills: ["ずつき", "たいあたり"],
    drops: [
      { materialId: "mat-003", rate: 0.5, minQty: 1, maxQty: 2 },
    ],
  },
*/
