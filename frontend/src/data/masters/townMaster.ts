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
      { ...getEquipmentById("eq-001")!, type: "equipment", price: 500 },  // 石の剣
      { ...getEquipmentById("eq-002")!, type: "equipment", price: 500 },  // 魔法の杖
      { ...getEquipmentById("eq-003")!, type: "equipment", price: 400 },  // 毛皮の鎧
      { ...getEquipmentById("eq-006")!, type: "equipment", price: 400 },  // 皮の鎧
      { ...getEquipmentById("eq-007")!, type: "equipment", price: 300 },  // スライムぼうし
      // 素材
      { id: "mat-001", type: "material", price: 100 },
      { id: "mat-002", type: "material", price: 150 },
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
      { ...getEquipmentById("eq-008")!, type: "equipment", price: 800 },  // 鉄の剣
      { ...getEquipmentById("eq-009")!, type: "equipment", price: 1200 }, // 鉄の鎧
      { id: "mat-006", type: "material", price: 300 },
      { id: "mat-007", type: "material", price: 350 },
      { id: "mat-008", type: "material", price: 200 },
    ]
  },
  {
    id: "town-003",
    name: "ラグナ",
    description: "エルダリア平原南部の漁師町。新鮮な魚介類が名物。",
    emoji: "🏘",
    npcs: [{ id: "npc-003", name: "魚屋のニルス", dialogue: "今日も良い獲れだよ！", emoji: "🐟" }],
    shopItems: [
      { ...getEquipmentById("eq-010")!, type: "equipment", price: 3000 }, // トライデント
      { id: "mat-009", type: "material", price: 400 },
      { id: "mat-010", type: "material", price: 350 },
      { id: "mat-011", type: "material", price: 500 },
    ]
  },
  {
    id: "town-004",
    name: "スエズ",
    description: "カルダ砂漠北西部の砂漠の砦。",
    emoji: "🏘",
    npcs: [{ id: "npc-004", name: "防具屋のガレス", dialogue: "しっかり準備していくんだ！", emoji: "🛡️" }],
    shopItems: [
      { ...getEquipmentById("eq-011")!, type: "equipment", price: 1500 }, // 砂漠の服
      { ...getEquipmentById("eq-012")!, type: "equipment", price: 2000 }, // サンゴーグラス
      { id: "mat-012", type: "material", price: 450 },
      { id: "mat-013", type: "material", price: 550 },
    ]
  },
  {
    id: "town-005",
    name: "カルダシティ",
    description: "カルダ砂漠の中心にある最大の町。",
    emoji: "🏘",
    npcs: [{ id: "npc-005", name: "魔法屋のセレス", dialogue: "興味があるのかね？", emoji: "🔮" }],
    shopItems: [
      { ...getEquipmentById("eq-013")!, type: "equipment", price: 3000 }, // 魔法のローブ
      { ...getEquipmentById("eq-014")!, type: "equipment", price: 2500 }, // 魔法の帽子
      { id: "mat-014", type: "material", price: 800 },
      { id: "mat-015", type: "material", price: 600 },
      { id: "mat-016", type: "material", price: 700 },
    ]
  },
  {
    id: "town-006",
    name: "エルーン",
    description: "ミルウッド深森に隠れたエルフの里。",
    emoji: "🏘",
    npcs: [{ id: "npc-006", name: "森の番人エルダ", dialogue: "気をつけて進むんだ。", emoji: "🌲" }],
    shopItems: [
      { ...getEquipmentById("eq-015")!, type: "equipment", price: 1800 }, // エルフの弓
      { ...getEquipmentById("eq-016")!, type: "equipment", price: 1600 }, // レザーアーマー
      { id: "mat-017", type: "material", price: 400 },
      { id: "mat-018", type: "material", price: 300 },
      { id: "mat-019", type: "material", price: 500 },
    ]
  },
  {
    id: "town-007",
    name: "フロスト村",
    description: "フロストハイム雪原の村。",
    emoji: "🏘",
    npcs: [{ id: "npc-007", name: "職人フリストフ", dialogue: "暖かい装備を準備しろ。", emoji: "❄️" }],
    shopItems: [
      { ...getEquipmentById("eq-017")!, type: "equipment", price: 2200 }, // 氷結晶の鎧
      { ...getEquipmentById("eq-018")!, type: "equipment", price: 1900 }, // 氷結晶の剣
      { id: "mat-010", type: "material", price: 450 },
      { id: "mat-020", type: "material", price: 650 },
    ]
  },
  {
    id: "town-008",
    name: "ウィンターホルム",
    description: "交易の中心地。",
    emoji: "🏘",
    npcs: [{ id: "npc-008", name: "交易商ルナ", dialogue: "何か探し物かね？", emoji: "🏪" }],
    shopItems: [
      { ...getEquipmentById("eq-019")!, type: "equipment", price: 5000 }, // 氷竜の槍
      { ...getEquipmentById("eq-020")!, type: "equipment", price: 4500 }, // 氷竜の盾
      { id: "mat-011", type: "material", price: 1000 },
      { id: "mat-014", type: "material", price: 1200 },
    ]
  },
  {
    id: "town-009",
    name: "カルダ旧市街",
    description: "古代都市の遺跡。",
    emoji: "🏘",
    npcs: [{ id: "npc-009", name: "調査員レオ", dialogue: "探索は慎重にね。", emoji: "🗿" }],
    shopItems: [
      { ...getEquipmentById("eq-021")!, type: "equipment", price: 6000 }, // 古代の剣
      { ...getEquipmentById("eq-022")!, type: "equipment", price: 5500 }, // 古代の盾
      { id: "mat-006", type: "material", price: 1000 },
    ]
  },
  {
    id: "town-010",
    name: "オアシス村",
    description: "火山帯の麓にある村。",
    emoji: "🏘",
    npcs: [{ id: "npc-010", name: "村長ファルコ", dialogue: "火山の恵みで生活している。", emoji: "🌋" }],
    shopItems: [
      { ...getEquipmentById("eq-023")!, type: "equipment", price: 3500 }, // 火山耐性の服
      { ...getEquipmentById("eq-024")!, type: "equipment", price: 4000 }, // 火山耐性の盾
      { id: "mat-016", type: "material", price: 900 },
    ]
  },
  {
    id: "town-011",
    name: "海底の砦",
    description: "海底神殿の中腹に築かれた潜水士たちの前線基地。",
    emoji: "🌊",
    npcs: [{ id: "npc-011", name: "潜水士キルア", dialogue: "深海は危険だ。準備万端で行けよ。", emoji: "🤿" }],
    shopItems: [
      { ...getEquipmentById("eq-032")!, type: "equipment", price: 7000 }, // 深海の宝剣
      { ...getEquipmentById("eq-033")!, type: "equipment", price: 8000 }, // 海竜の鎧
      { ...getEquipmentById("eq-034")!, type: "equipment", price: 7500 }, // 深海の盾
      { id: "mat-022", type: "material", price: 1500 },
      { id: "mat-014", type: "material", price: 1200 },
    ]
  },
  {
    id: "town-012",
    name: "沼地の番小屋",
    description: "毒の沼地の入口付近に建つ、一見廃屋のような小屋。",
    emoji: "🏚",
    npcs: [{ id: "npc-012", name: "老薬師ゼル", dialogue: "毒には毒を。備えておけ。", emoji: "🧪" }],
    shopItems: [
      { id: "mat-021", type: "material", price: 400 },
      { id: "mat-015", type: "material", price: 500 },
      { id: "mat-007", type: "material", price: 400 },
    ]
  },
  {
    id: "town-013",
    name: "古代遺跡の番所",
    description: "ミルウッドの奥に残る古代遺跡の入口に設置された番所。",
    emoji: "🗿",
    npcs: [{ id: "npc-013", name: "遺跡守ガル", dialogue: "先人の知恵がここに眠る。", emoji: "🏛️" }],
    shopItems: [
      { ...getEquipmentById("eq-021")!, type: "equipment", price: 6500 }, // 古代の剣
      { ...getEquipmentById("eq-029")!, type: "equipment", price: 6000 }, // 古代の鎧
      { id: "mat-006", type: "material", price: 1000 },
    ]
  },
  {
    id: "town-015",
    name: "氷窟の灯台",
    description: "氷の魔窟への入口に建つ小さな灯台。旅人に道を示す。",
    emoji: "🏮",
    npcs: [{ id: "npc-015", name: "氷窟の守衛ビョルン", dialogue: "凍えた心にも灯を。", emoji: "🕯️" }],
    shopItems: [
      { ...getEquipmentById("eq-037")!, type: "equipment", price: 8500 }, // 氷晶の剣
      { ...getEquipmentById("eq-038")!, type: "equipment", price: 9000 }, // 氷晶の鎧
      { id: "mat-027", type: "material", price: 1800 },
      { id: "mat-010", type: "material", price: 800 },
    ]
  },
  {
    id: "town-016",
    name: "竜の里",
    description: "竜の棲み処に近い山の集落。竜と共存する勇猛な一族が住む。",
    emoji: "🏔",
    npcs: [{ id: "npc-016", name: "竜使いドラゴ", dialogue: "竜は強い。だがお前も強くなれる。", emoji: "🐉" }],
    shopItems: [
      { ...getEquipmentById("eq-035")!, type: "equipment", price: 9000 }, // 炎の剣
      { ...getEquipmentById("eq-036")!, type: "equipment", price: 10000 }, // 竜の鱗の鎧
      { id: "mat-026", type: "material", price: 2000 },
      { id: "mat-028", type: "material", price: 1600 },
    ]
  },
  {
    id: "town-017",
    name: "竜の巣の前哨基地",
    description: "竜の棲み処の中心部に設けられた調査隊の前哨基地。",
    emoji: "⛺",
    npcs: [{ id: "npc-017", name: "調査隊長フォルス", dialogue: "ここより先は真の猛者のみが踏み込める。", emoji: "🔭" }],
    shopItems: [
      { id: "mat-026", type: "material", price: 2500 },
      { id: "mat-016", type: "material", price: 1200 },
      { id: "mat-028", type: "material", price: 2000 },
    ]
  },
  {
    id: "town-018",
    name: "天空の城塞",
    description: "天空聖殿の麓に築かれた空中要塞。光の騎士団が守護する。",
    emoji: "☁️",
    npcs: [{ id: "npc-018", name: "光の騎士エリアス", dialogue: "神の加護があらんことを。", emoji: "⚔️" }],
    shopItems: [
      { ...getEquipmentById("eq-039")!, type: "equipment", price: 15000 }, // 天使の弓
      { ...getEquipmentById("eq-040")!, type: "equipment", price: 12000 }, // 天空のローブ
      { id: "mat-025", type: "material", price: 3000 },
      { id: "mat-006", type: "material", price: 2000 },
    ]
  },
  {
    id: "town-019",
    name: "奈落の前哨基地",
    description: "魔王城手前の最後の前線基地。勇者たちが決死の覚悟で集う。",
    emoji: "💀",
    npcs: [{ id: "npc-019", name: "前線指揮官ダルク", dialogue: "引き返すなら今のうちだ。", emoji: "🗡️" }],
    shopItems: [
      { ...getEquipmentById("eq-041")!, type: "equipment", price: 20000 }, // 魔王の剣
      { ...getEquipmentById("eq-042")!, type: "equipment", price: 22000 }, // 魔王の鎧
      { ...getEquipmentById("eq-043")!, type: "equipment", price: 18000 }, // 黄金の盾
      { id: "mat-024", type: "material", price: 5000 },
    ]
  },
  {
    id: "town-020",
    name: "深海基地",
    description: "深海の底に作られた水密の前線基地。深海の魔物と戦う探索隊の拠点。",
    emoji: "🌊",
    npcs: [{ id: "npc-020", name: "深海探索士ネレイ", dialogue: "この先は未知の深海だ。命を大切に。", emoji: "🤿" }],
    shopItems: [
      { ...getEquipmentById("eq-032")!, type: "equipment", price: 9000 }, // 深海の宝剣
      { ...getEquipmentById("eq-033")!, type: "equipment", price: 10000 }, // 海竜の鎧
      { id: "mat-029", type: "material", price: 2000 },
      { id: "mat-022", type: "material", price: 1800 },
    ]
  },
  {
    id: "town-021",
    name: "光の聖堂",
    description: "光の聖域の中心に建つ神聖な礼拝堂。光の騎士たちが修行する聖地。",
    emoji: "🌟",
    npcs: [{ id: "npc-021", name: "聖堂の神官ルクス", dialogue: "光の神の祝福があなたに届きますように。", emoji: "✨" }],
    shopItems: [
      { ...getEquipmentById("eq-039")!, type: "equipment", price: 18000 }, // 天使の弓
      { ...getEquipmentById("eq-040")!, type: "equipment", price: 15000 }, // 天空のローブ
      { id: "mat-030", type: "material", price: 3500 },
      { id: "mat-025", type: "material", price: 3000 },
    ]
  },
  {
    id: "town-022",
    name: "闇の前哨砦",
    description: "闇の神殿の入口に設けられた最後の砦。強者のみがここに辿り着ける。",
    emoji: "🖤",
    npcs: [{ id: "npc-022", name: "闇の番人ヴォルグ", dialogue: "ここより先は闇の支配域。覚悟を決めて進め。", emoji: "💀" }],
    shopItems: [
      { ...getEquipmentById("eq-041")!, type: "equipment", price: 25000 }, // 魔王の剣
      { ...getEquipmentById("eq-042")!, type: "equipment", price: 28000 }, // 魔王の鎧
      { id: "mat-031", type: "material", price: 6000 },
      { id: "mat-024", type: "material", price: 5500 },
    ]
  },
  {
    id: "town-023",
    name: "古代神殿の門前",
    description: "古代の神殿への入口を守る小さな集落。古代遺跡の研究者たちが集まる。",
    emoji: "🏛️",
    npcs: [{ id: "npc-023", name: "古代学者アルキメ", dialogue: "古代文明の謎を解き明かしたい…！", emoji: "📜" }],
    shopItems: [
      { ...getEquipmentById("eq-021")!, type: "equipment", price: 7500 }, // 古代の剣
      { ...getEquipmentById("eq-029")!, type: "equipment", price: 7000 }, // 古代の鎧
      { id: "mat-032", type: "material", price: 2500 },
      { id: "mat-006", type: "material", price: 1500 },
    ]
  },
  {
    id: "town-024",
    name: "氷神殿の入口",
    description: "氷雪神殿への入口付近に建つ雪深い山小屋。氷の精霊を研究する魔法使いが住む。",
    emoji: "🏔",
    npcs: [{ id: "npc-024", name: "氷術師フリーザ", dialogue: "氷の女王の力は計り知れない。油断するな。", emoji: "🧊" }],
    shopItems: [
      { ...getEquipmentById("eq-037")!, type: "equipment", price: 11000 }, // 氷晶の剣
      { ...getEquipmentById("eq-038")!, type: "equipment", price: 12000 }, // 氷晶の鎧
      { id: "mat-033", type: "material", price: 3000 },
      { id: "mat-027", type: "material", price: 2000 },
    ]
  },
  {
    id: "town-014",
    name: "マグマの洞窟",
    description: "溶岩モンスターが巣食う危険な場所。",
    emoji: "🏘",
    npcs: [{ id: "npc-014", name: "調査員マグマ", dialogue: "希少な鉱物が眠っているぞ。", emoji: "🌋" }],
    shopItems: [
      { ...getEquipmentById("eq-025")!, type: "equipment", price: 8000 }, // 溶岩の鎧
      { ...getEquipmentById("eq-026")!, type: "equipment", price: 7500 }, // 溶岩の盾
      { id: "mat-013", type: "material", price: 1200 },
      { id: "mat-007", type: "material", price: 1000 },
    ]
  }
];

export const TOWN_MAP: Record<string, TownMaster> = TOWN_MASTER.reduce((acc, town) => {
  acc[town.id] = town;
  return acc;
}, {} as Record<string, TownMaster>);