import type { StoryNPC } from "../../types/masters";

export const STORY_NPC_MASTER: StoryNPC[] = [
  // === 序章: エルダリア平原 ===
  {
    id: "snpc-001",
    name: "ギルドマスター",
    description: "新米ギルドマスターを導く先輩",
    emoji: "👴",
    mapId: "map-001",
    position: { row: 3, col: 4 },
    dialogues: [
      {
        text: "ようこそ、新米ギルドマスターさん！まずは装備を整え、周辺のスライムを狩って経験を積みましょう。",
      },
      {
        condition: { flag: "defeated_first_slime", value: true },
        text: "よくやった！これからが本当の冒険だ。砂漠や雪原へも挑戦してみるといい。",
      },
    ],
  },
  {
    id: "snpc-002",
    name: "旅人のサラ",
    description: "世界各地を旅する女性",
    emoji: "👩",
    mapId: "map-001",
    position: { row: 10, col: 5 },
    dialogues: [
      {
        text: "ミドウェイの宿屋は快適ですよ。長旅の疲れを癒してくださいね。",
      },
      {
        condition: { flag: "visited_desert", value: true },
        text: "カルダ砂漠は暑いですね。砂漠の服が必要ですよ。",
      },
    ],
  },

  // === 第一章: カルダ砂漠 ===
  {
    id: "snpc-003",
    name: "砂漠の商人",
    description: "砂漠で商売をしている老人",
    emoji: "👳",
    mapId: "map-002",
    position: { row: 6, col: 10 },
    dialogues: [
      {
        text: "カラカラだなぁ…水は重要だ。カルダシティには魔法屋もあるぞ。",
      },
      {
        condition: { flag: "defeated_goblin_chief", value: true },
        text: "ゴブリン族長を倒したとは！君は強くなったな。アビスの奈落にも挑めるかもしれない。",
      },
    ],
  },
  {
    id: "snpc-004",
    name: "古代学者",
    description: "カルダ旧市街を研究する学者",
    emoji: "🧓",
    mapId: "map-002",
    position: { row: 14, col: 1 },
    dialogues: [
      {
        text: "この砂漠には古代都市の遺跡が眠っている…探索は慎重にね。",
      },
      {
        condition: { flag: "found_ancient_ruins", value: true },
        text: "遺跡の謎を解き明かすには、もっと強くなる必要があるな。",
      },
    ],
  },

  // === 第二章: フロストハイム雪原 ===
  {
    id: "snpc-005",
    name: "雪の案内人",
    description: "雪原を案内する青年",
    emoji: "🧑",
    mapId: "map-003",
    position: { row: 4, col: 5 },
    dialogues: [
      {
        text: "フロストハイム雪原へようこそ。寒さ対策は大丈夫？氷結晶の装備が必要です。",
      },
      {
        condition: { flag: "defeated_water_dragon", value: true },
        text: "水竜を倒したとは！セレスティア聖域への道が開かれたかもしれない。",
      },
    ],
  },
  {
    id: "snpc-006",
    name: "天空の見守り者",
    description: "セレスティア聖域を守る守護者",
    emoji: "🧚",
    mapId: "map-003",
    position: { row: 0, col: 1 },
    dialogues: [
      {
        text: "ここより先は天空への道。光の都エンシェントを抜けた先に、天空神殿が聳え立つ。",
      },
      {
        condition: { flag: "reached_celestial_sanctuary", value: true },
        text: "光の加護があなたに届きますように。",
      },
    ],
  },

  // === 第三章: ミルウッドの深森 ===
  {
    id: "snpc-007",
    name: "森の守護者",
    description: "ミルウッド深森を守るエルフ",
    emoji: "🧝",
    mapId: "map-004",
    position: { row: 3, col: 2 },
    dialogues: [
      {
        text: "気をつけて進むんだ。森には精霊が宿るが、魔物も多い。",
      },
      {
        condition: { flag: "defeated_nine_tailed_fox", value: true },
        text: "九尾の狐を倒したとは…君は森の勇者だ。",
      },
    ],
  },
  {
    id: "snpc-008",
    name: "毒の沼地の案内人",
    description: "毒の沼地を知る老人",
    emoji: "👴",
    mapId: "map-011",
    position: { row: 5, col: 7 },
    dialogues: [
      {
        text: "毒には毒を。備えておけ。沼地の毒は強力だ。",
      },
      {
        condition: { flag: "survived_poison_swamp", value: true },
        text: "よく生き残ったな。古代の神殿への道が開かれたかもしれない。",
      },
    ],
  },

  // === 第四章: ヴォルカノス火山帯 ===
  {
    id: "snpc-009",
    name: "火山の研究者",
    description: "火山帯を研究する学者",
    emoji: "🧑‍🔬",
    mapId: "map-005",
    position: { row: 10, col: 14 },
    dialogues: [
      {
        text: "この火山帯は危険だ。溶岩モンスターが巣食っている。",
      },
      {
        condition: { flag: "defeated_salamander", value: true },
        text: "サラマンダーを倒したとは！竜の棲み処への道が開かれたかもしれない。",
      },
    ],
  },
  {
    id: "snpc-010",
    name: "竜の伝承者",
    description: "竜の知識を持つ老人",
    emoji: "🐉",
    mapId: "map-013",
    position: { row: 5, col: 10 },
    dialogues: [
      {
        text: "竜は強い。だがお前も強くなれる。竜の里で装備を整えるんだ。",
      },
      {
        condition: { flag: "defeated_dragon_lord", value: true },
        text: "古竜を倒したとは…君は真の勇者だ。",
      },
    ],
  },

  // === 第五章: 海底神殿 ===
  {
    id: "snpc-011",
    name: "潜水士キルア",
    description: "深海を探検する潜水士",
    emoji: "🤿",
    mapId: "map-008",
    position: { row: 5, col: 5 },
    dialogues: [
      {
        text: "深海は危険だ。準備万端で行けよ。深海の宝珠が眠ると伝わる。",
      },
      {
        condition: { flag: "reached_deep_sea", value: true },
        text: "未知の深海に到達したとは…深海の魔魚に気をつけろ。",
      },
    ],
  },

  // === 第六章: 天空への道 ===
  {
    id: "snpc-012",
    name: "光の騎士エリアス",
    description: "天空聖殿を守る騎士",
    emoji: "⚔️",
    mapId: "map-009",
    position: { row: 6, col: 3 },
    dialogues: [
      {
        text: "神の加護があらんことを。光の聖域へ進むには、さらに強くなる必要がある。",
      },
      {
        condition: { flag: "reached_light_sanctuary", value: true },
        text: "光の聖域に到達したとは…光の天使との戦いに備えよ。",
      },
    ],
  },

  // === 第七章: 氷の深淵 ===
  {
    id: "snpc-013",
    name: "氷窟の守衛ビョルン",
    description: "氷の魔窟を守る守衛",
    emoji: "🕯️",
    mapId: "map-012",
    position: { row: 1, col: 10 },
    dialogues: [
      {
        text: "凍えた心にも灯を。氷の魔窟は危険だ。氷のゴーレムに気をつけろ。",
      },
      {
        condition: { flag: "reached_ice_temple", value: true },
        text: "氷雪神殿に到達したとは…雪の女王との戦いに備えよ。",
      },
    ],
  },

  // === 第八章: 古代の神秘 ===
  {
    id: "snpc-014",
    name: "古代学者アルキメ",
    description: "古代遺跡を研究する学者",
    emoji: "📜",
    mapId: "map-017",
    position: { row: 11, col: 11 },
    dialogues: [
      {
        text: "古代文明の謎を解き明かしたい…！古代の番人が遺産を守っている。",
      },
      {
        condition: { flag: "solved_ancient_mystery", value: true },
        text: "古代の知恵を手に入れたとは…君は真の学者だ。",
      },
    ],
  },

  // === 終章: 闇と光の戦い ===
  {
    id: "snpc-015",
    name: "前線指揮官ダルク",
    description: "魔王城手前の指揮官",
    emoji: "🗡️",
    mapId: "map-010",
    position: { row: 11, col: 8 },
    dialogues: [
      {
        text: "引き返すなら今のうちだ。ここより先は魔王の領域だ。",
      },
      {
        condition: { flag: "defeated_demon_king", value: true },
        text: "魔王を倒したとは…君は伝説の勇者だ！",
      },
    ],
  },
  {
    id: "snpc-016",
    name: "闇の番人ヴォルグ",
    description: "闇の神殿を守る番人",
    emoji: "💀",
    mapId: "map-016",
    position: { row: 10, col: 10 },
    dialogues: [
      {
        text: "ここより先は闇の支配域。覚悟を決めて進め。闇の大魔神が君を待っている。",
      },
      {
        condition: { flag: "defeated_dark_god", value: true },
        text: "闇の大魔神を倒したとは…君は真の救世主だ！",
      },
    ],
  },
];

export const STORY_NPC_MAP: Record<string, StoryNPC> = Object.fromEntries(
  STORY_NPC_MASTER.map((npc) => [npc.id, npc])
);
