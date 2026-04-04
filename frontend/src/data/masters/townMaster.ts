import type { TownMaster } from "../../types/town";
import { getEquipmentById } from "./equipmentMaster";

export const TOWN_MASTER: TownMaster[] = [
  {
    id: "town-001",
    name: "グリーンハンマー",
    description: "草原の中心に位置する小さな町。新米ギルドマスターの拠点として賑わっている。",
    emoji: "🏘",
    npcs: [
      {
        id: "npc-001",
        name: "武器屋のオルガ",
        dialogue: "よくいらっしゃい！良い装備が揃っているよ、ギルドマスターさん！",
        emoji: "🔨"
      }
    ],
    shopItems: [
      // 装備品 (整理後のIDを参照)
      { ...getEquipmentById("eq-001")!, type: "equipment", price: 50 },  // 石の剣
      { ...getEquipmentById("eq-002")!, type: "equipment", price: 50 },  // 魔法の杖
      { ...getEquipmentById("eq-003")!, type: "equipment", price: 40 },  // 毛皮の鎧
      { ...getEquipmentById("eq-006")!, type: "equipment", price: 40 },  // 皮の鎧
      { ...getEquipmentById("eq-007")!, type: "equipment", price: 30 },  // スライムぼうし
      // 素材
      { id: "mat-001", type: "material", price: 10 },
      { id: "mat-002", type: "material", price: 15 },
      { id: "mat-003", type: "material", price: 20 },
      { id: "mat-004", type: "material", price: 25 },
      { id: "mat-005", type: "material", price: 12 },
    ]
  },
  {
    id: "town-002", 
    name: "ミドウェイ",
    description: "エルダリア平原とカルダ砂漠の中継地点。旅人たちで賑わっている宿場町。",
    emoji: "🏘",
    npcs: [
      {
        id: "npc-002",
        name: "宿屋のマリア",
        dialogue: "長旅お疲れ様です。ゆっくり休んでいかがですか？",
        emoji: "🛏"
      }
    ],
    shopItems: [
      { ...getEquipmentById("eq-008")!, type: "equipment", price: 80 },  // 鉄の剣
      { ...getEquipmentById("eq-009")!, type: "equipment", price: 120 }, // 鉄の鎧
      { id: "mat-006", type: "material", price: 30 },
      { id: "mat-007", type: "material", price: 35 },
      { id: "mat-008", type: "material", price: 20 },
    ]
  },
  {
    id: "town-003",
    name: "ラグナ",
    description: "エルダリア平原南部の漁師町。新鮮な魚介類が名物。",
    emoji: "🏘",
    npcs: [{ id: "npc-003", name: "魚屋のニルス", dialogue: "今日も良い獲れだよ！", emoji: "🐟" }],
    shopItems: [
      { ...getEquipmentById("eq-010")!, type: "equipment", price: 100 }, // トライデント
      { id: "mat-009", type: "material", price: 40 },
      { id: "mat-010", type: "material", price: 35 },
      { id: "mat-011", type: "material", price: 50 },
    ]
  },
  {
    id: "town-004",
    name: "スエズ",
    description: "カルダ砂漠北西部の砂漠の砦。",
    emoji: "🏘",
    npcs: [{ id: "npc-004", name: "防具屋のガレス", dialogue: "しっかり準備していくんだ！", emoji: "🛡️" }],
    shopItems: [
      { ...getEquipmentById("eq-011")!, type: "equipment", price: 150 }, // 砂漠の服
      { ...getEquipmentById("eq-012")!, type: "equipment", price: 200 }, // サンゴーグラス
      { id: "mat-012", type: "material", price: 45 },
      { id: "mat-013", type: "material", price: 55 },
    ]
  },
  {
    id: "town-005",
    name: "カルダシティ",
    description: "カルダ砂漠の中心にある最大の町。",
    emoji: "🏘",
    npcs: [{ id: "npc-005", name: "魔法屋のセレス", dialogue: "興味があるのかね？", emoji: "🔮" }],
    shopItems: [
      { ...getEquipmentById("eq-013")!, type: "equipment", price: 300 }, // 魔法のローブ
      { ...getEquipmentById("eq-014")!, type: "equipment", price: 250 }, // 魔法の帽子
      { id: "mat-014", type: "material", price: 80 },
      { id: "mat-015", type: "material", price: 60 },
      { id: "mat-016", type: "material", price: 70 },
    ]
  },
  {
    id: "town-006",
    name: "エルーン",
    description: "ミルウッド深森に隠れたエルフの里。",
    emoji: "🏘",
    npcs: [{ id: "npc-006", name: "森の番人エルダ", dialogue: "気をつけて進むんだ。", emoji: "🌲" }],
    shopItems: [
      { ...getEquipmentById("eq-015")!, type: "equipment", price: 180 }, // エルフの弓
      { ...getEquipmentById("eq-016")!, type: "equipment", price: 160 }, // レザーアーマー
      { id: "mat-017", type: "material", price: 40 },
      { id: "mat-018", type: "material", price: 30 },
      { id: "mat-019", type: "material", price: 50 },
    ]
  },
  {
    id: "town-007",
    name: "フロスト村",
    description: "フロストハイム雪原の村。",
    emoji: "🏘",
    npcs: [{ id: "npc-007", name: "職人フリストフ", dialogue: "暖かい装備を準備しろ。", emoji: "❄️" }],
    shopItems: [
      { ...getEquipmentById("eq-017")!, type: "equipment", price: 220 }, // 氷結晶の鎧
      { ...getEquipmentById("eq-018")!, type: "equipment", price: 190 }, // 氷結晶の剣
      { id: "mat-010", type: "material", price: 45 },
      { id: "mat-020", type: "material", price: 65 },
    ]
  },
  {
    id: "town-008",
    name: "ウィンターホルム",
    description: "交易の中心地。",
    emoji: "🏘",
    npcs: [{ id: "npc-008", name: "交易商ルナ", dialogue: "何か探し物かね？", emoji: "🏪" }],
    shopItems: [
      { ...getEquipmentById("eq-019")!, type: "equipment", price: 500 }, // 氷竜の槍
      { ...getEquipmentById("eq-020")!, type: "equipment", price: 450 }, // 氷竜の盾
      { id: "mat-011", type: "material", price: 100 },
      { id: "mat-014", type: "material", price: 120 },
    ]
  },
  {
    id: "town-009",
    name: "カルダ旧市街",
    description: "古代都市の遺跡。",
    emoji: "🏘",
    npcs: [{ id: "npc-009", name: "調査員レオ", dialogue: "探索は慎重にね。", emoji: "🗿" }],
    shopItems: [
      { ...getEquipmentById("eq-021")!, type: "equipment", price: 600 }, // 古代の剣
      { ...getEquipmentById("eq-022")!, type: "equipment", price: 550 }, // 古代の盾
      { id: "mat-006", type: "material", price: 100 },
    ]
  },
  {
    id: "town-010",
    name: "オアシス村",
    description: "火山帯の麓にある村。",
    emoji: "🏘",
    npcs: [{ id: "npc-010", name: "村長ファルコ", dialogue: "火山の恵みで生活している。", emoji: "🌋" }],
    shopItems: [
      { ...getEquipmentById("eq-023")!, type: "equipment", price: 350 }, // 火山耐性の服
      { ...getEquipmentById("eq-024")!, type: "equipment", price: 400 }, // 火山耐性の盾
      { id: "mat-016", type: "material", price: 90 },
    ]
  },
  {
    id: "town-014",
    name: "マグマの洞窟",
    description: "溶岩モンスターが巣食う危険な場所。",
    emoji: "🏘",
    npcs: [{ id: "npc-014", name: "調査員マグマ", dialogue: "希少な鉱物が眠っているぞ。", emoji: "🌋" }],
    shopItems: [
      { ...getEquipmentById("eq-025")!, type: "equipment", price: 800 }, // 溶岩の鎧
      { ...getEquipmentById("eq-026")!, type: "equipment", price: 750 }, // 溶岩の盾
      { id: "mat-013", type: "material", price: 120 },
      { id: "mat-007", type: "material", price: 100 },
    ]
  }
];

export const TOWN_MAP: Record<string, TownMaster> = TOWN_MASTER.reduce((acc, town) => {
  acc[town.id] = town;
  return acc;
}, {} as Record<string, TownMaster>);