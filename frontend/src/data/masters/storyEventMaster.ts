import type { StoryEvent } from "../../types/masters";

export const STORY_EVENT_MASTER: StoryEvent[] = [
  // === 序章: エルダリア平原 ===
  {
    id: "evt-001",
    name: "最初の戦い",
    description: "ギルドマスターからスライムを倒すように指示される",
    chapter: 0,
    mapId: "map-001",
    position: { row: 4, col: 5 },
    trigger: "step",
    conditions: [
      { type: "flag", flag: "tutorial_started", value: false },
    ],
    data: {
      type: "conversation",
      npcId: "snpc-001",
      dialogue: "ようこそ、新米ギルドマスターさん！まずは周辺のスライムを狩って経験を積みましょう。",
      choices: [
        {
          text: "了解しました",
          rewards: [
            { type: "flag", flag: "tutorial_started" },
            { type: "equipment", itemId: "eq-001", quantity: 1 },
          ],
        },
      ],
    },
    repeatable: false,
  },
  {
    id: "evt-002",
    name: "スライム討伐",
    description: "最初のスライムを倒す",
    chapter: 0,
    mapId: "map-001",
    position: { row: 5, col: 5 },
    trigger: "step",
    conditions: [
      { type: "flag", flag: "tutorial_started", value: true },
      { type: "flag", flag: "defeated_first_slime", value: false },
    ],
    data: {
      type: "battle",
      enemyIds: ["e-001"],
      winRewards: [
        { type: "flag", flag: "defeated_first_slime" },
        { type: "exp", exp: 50 },
        { type: "gold", gold: 20 },
      ],
    },
    repeatable: false,
    nextEventId: "evt-003",
  },
  {
    id: "evt-003",
    name: "ギルドマスターからの称賛",
    description: "最初の戦いを終えてギルドマスターに報告",
    chapter: 0,
    mapId: "map-001",
    position: { row: 4, col: 5 },
    trigger: "interact",
    conditions: [
      { type: "flag", flag: "defeated_first_slime", value: true },
    ],
    data: {
      type: "conversation",
      npcId: "snpc-001",
      dialogue: "よくやった！これからが本当の冒険だ。砂漠や雪原へも挑戦してみるといい。",
      choices: [
        {
          text: "ありがとうございます！",
          rewards: [
            { type: "gold", gold: 100 },
          ],
        },
      ],
    },
    repeatable: false,
  },

  // === 第一章: カルダ砂漠 ===
  {
    id: "evt-010",
    name: "砂漠への入り口",
    description: "カルダ砂漠へ向かう",
    chapter: 1,
    mapId: "map-001",
    position: { row: 13, col: 18 },
    trigger: "step",
    conditions: [
      { type: "flag", flag: "visited_desert", value: false },
      { type: "flag", flag: "defeated_first_slime", value: true },
    ],
    data: {
      type: "conversation",
      npcId: "snpc-002",
      dialogue: "カルダ砂漠は暑いですね。砂漠の服が必要ですよ。",
      choices: [
        {
          text: "砂漠へ進む",
          rewards: [
            { type: "flag", flag: "visited_desert" },
          ],
        },
      ],
    },
    repeatable: false,
  },
  {
    id: "evt-011",
    name: "ゴブリン族長との戦い",
    description: "カルダ砂漠でゴブリン族長と戦う",
    chapter: 1,
    mapId: "map-002",
    position: { row: 10, col: 10 },
    trigger: "step",
    conditions: [
      { type: "flag", flag: "visited_desert", value: true },
      { type: "flag", flag: "defeated_goblin_chief", value: false },
    ],
    data: {
      type: "battle",
      enemyIds: ["e-023", "e-004", "e-004"],
      winRewards: [
        { type: "flag", flag: "defeated_goblin_chief" },
        { type: "exp", exp: 200 },
        { type: "gold", gold: 150 },
        { type: "equipment", itemId: "eq-011", quantity: 1 },
      ],
    },
    repeatable: false,
  },
  {
    id: "evt-012",
    name: "古代遺跡の発見",
    description: "カルダ旧市街で古代遺跡を発見",
    chapter: 1,
    mapId: "map-002",
    position: { row: 13, col: 2 },
    trigger: "interact",
    conditions: [
      { type: "flag", flag: "defeated_goblin_chief", value: true },
      { type: "flag", flag: "found_ancient_ruins", value: false },
    ],
    data: {
      type: "conversation",
      npcId: "snpc-004",
      dialogue: "遺跡の謎を解き明かすには、もっと強くなる必要があるな。",
      choices: [
        {
          text: "了解しました",
          rewards: [
            { type: "flag", flag: "found_ancient_ruins" },
          ],
        },
      ],
    },
    repeatable: false,
  },

  // === 第二章: フロストハイム雪原 ===
  {
    id: "evt-020",
    name: "雪原への入り口",
    description: "フロストハイム雪原へ向かう",
    chapter: 2,
    mapId: "map-001",
    position: { row: 3, col: 13 },
    trigger: "step",
    conditions: [
      { type: "flag", flag: "visited_snowfield", value: false },
      { type: "flag", flag: "defeated_first_slime", value: true },
    ],
    data: {
      type: "conversation",
      npcId: "snpc-005",
      dialogue: "フロストハイム雪原へようこそ。寒さ対策は大丈夫？",
      choices: [
        {
          text: "雪原へ進む",
          rewards: [
            { type: "flag", flag: "visited_snowfield" },
            { type: "equipment", itemId: "eq-017", quantity: 1 },
          ],
        },
      ],
    },
    repeatable: false,
  },
  {
    id: "evt-021",
    name: "水竜との戦い",
    description: "フロストハイム雪原で水竜と戦う",
    chapter: 2,
    mapId: "map-003",
    position: { row: 10, col: 10 },
    trigger: "step",
    conditions: [
      { type: "flag", flag: "visited_snowfield", value: true },
      { type: "flag", flag: "defeated_water_dragon", value: false },
    ],
    data: {
      type: "battle",
      enemyIds: ["e-012", "e-011", "e-011"],
      winRewards: [
        { type: "flag", flag: "defeated_water_dragon" },
        { type: "exp", exp: 300 },
        { type: "gold", gold: 200 },
        { type: "equipment", itemId: "eq-018", quantity: 1 },
      ],
    },
    repeatable: false,
  },
  {
    id: "evt-022",
    name: "天空への道",
    description: "セレスティア聖域へ向かう",
    chapter: 2,
    mapId: "map-003",
    position: { row: 1, col: 2 },
    trigger: "interact",
    conditions: [
      { type: "flag", flag: "defeated_water_dragon", value: true },
      { type: "flag", flag: "reached_celestial_sanctuary", value: false },
    ],
    data: {
      type: "conversation",
      npcId: "snpc-006",
      dialogue: "光の加護があなたに届きますように。",
      choices: [
        {
          text: "天空へ進む",
          rewards: [
            { type: "flag", flag: "reached_celestial_sanctuary" },
          ],
        },
      ],
    },
    repeatable: false,
  },

  // === 第三章: ミルウッドの深森 ===
  {
    id: "evt-030",
    name: "深森への入り口",
    description: "ミルウッドの深森へ向かう",
    chapter: 3,
    mapId: "map-001",
    position: { row: 10, col: 1 },
    trigger: "step",
    conditions: [
      { type: "flag", flag: "visited_forest", value: false },
      { type: "flag", flag: "defeated_first_slime", value: true },
    ],
    data: {
      type: "conversation",
      npcId: "snpc-007",
      dialogue: "気をつけて進むんだ。森には精霊が宿るが、魔物も多い。",
      choices: [
        {
          text: "森へ進む",
          rewards: [
            { type: "flag", flag: "visited_forest" },
            { type: "equipment", itemId: "eq-015", quantity: 1 },
          ],
        },
      ],
    },
    repeatable: false,
  },
  {
    id: "evt-031",
    name: "九尾の狐との戦い",
    description: "ミルウッドの深森で九尾の狐と戦う",
    chapter: 3,
    mapId: "map-004",
    position: { row: 10, col: 10 },
    trigger: "step",
    conditions: [
      { type: "flag", flag: "visited_forest", value: true },
      { type: "flag", flag: "defeated_nine_tailed_fox", value: false },
    ],
    data: {
      type: "battle",
      enemyIds: ["e-034", "e-033", "e-032"],
      winRewards: [
        { type: "flag", flag: "defeated_nine_tailed_fox" },
        { type: "exp", exp: 400 },
        { type: "gold", gold: 300 },
        { type: "equipment", itemId: "eq-016", quantity: 1 },
      ],
    },
    repeatable: false,
  },

  // === 第四章: ヴォルカノス火山帯 ===
  {
    id: "evt-040",
    name: "火山帯への入り口",
    description: "ヴォルカノス火山帯へ向かう",
    chapter: 4,
    mapId: "map-001",
    position: { row: 18, col: 6 },
    trigger: "step",
    conditions: [
      { type: "flag", flag: "visited_volcano", value: false },
      { type: "flag", flag: "defeated_first_slime", value: true },
    ],
    data: {
      type: "conversation",
      npcId: "snpc-009",
      dialogue: "この火山帯は危険だ。溶岩モンスターが巣食っている。",
      choices: [
        {
          text: "火山帯へ進む",
          rewards: [
            { type: "flag", flag: "visited_volcano" },
            { type: "equipment", itemId: "eq-023", quantity: 1 },
          ],
        },
      ],
    },
    repeatable: false,
  },
  {
    id: "evt-041",
    name: "サラマンダーとの戦い",
    description: "ヴォルカノス火山帯でサラマンダーと戦う",
    chapter: 4,
    mapId: "map-005",
    position: { row: 10, col: 10 },
    trigger: "step",
    conditions: [
      { type: "flag", flag: "visited_volcano", value: true },
      { type: "flag", flag: "defeated_salamander", value: false },
    ],
    data: {
      type: "battle",
      enemyIds: ["e-068", "e-028", "e-007"],
      winRewards: [
        { type: "flag", flag: "defeated_salamander" },
        { type: "exp", exp: 500 },
        { type: "gold", gold: 400 },
        { type: "equipment", itemId: "eq-025", quantity: 1 },
      ],
    },
    repeatable: false,
  },
  {
    id: "evt-042",
    name: "竜の棲み処へ",
    description: "竜の棲み処へ向かう",
    chapter: 4,
    mapId: "map-013",
    position: { row: 5, col: 10 },
    trigger: "interact",
    conditions: [
      { type: "flag", flag: "defeated_salamander", value: true },
      { type: "flag", flag: "reached_dragon_lair", value: false },
    ],
    data: {
      type: "conversation",
      npcId: "snpc-010",
      dialogue: "竜は強い。だがお前も強くなれる。",
      choices: [
        {
          text: "竜の里へ進む",
          rewards: [
            { type: "flag", flag: "reached_dragon_lair" },
          ],
        },
      ],
    },
    repeatable: false,
  },

  // === 第五章: 海底神殿 ===
  {
    id: "evt-050",
    name: "海底神殿への入り口",
    description: "海底神殿へ向かう",
    chapter: 5,
    mapId: "map-001",
    position: { row: 7, col: 1 },
    trigger: "step",
    conditions: [
      { type: "flag", flag: "visited_underwater", value: false },
      { type: "flag", flag: "defeated_first_slime", value: true },
    ],
    data: {
      type: "conversation",
      npcId: "snpc-011",
      dialogue: "深海は危険だ。準備万端で行けよ。",
      choices: [
        {
          text: "海底へ進む",
          rewards: [
            { type: "flag", flag: "visited_underwater" },
            { type: "equipment", itemId: "eq-032", quantity: 1 },
          ],
        },
      ],
    },
    repeatable: false,
  },
  {
    id: "evt-051",
    name: "深海の底へ",
    description: "深海の底へ到達",
    chapter: 5,
    mapId: "map-014",
    position: { row: 5, col: 5 },
    trigger: "interact",
    conditions: [
      { type: "flag", flag: "visited_underwater", value: true },
      { type: "flag", flag: "reached_deep_sea", value: false },
    ],
    data: {
      type: "conversation",
      npcId: "snpc-011",
      dialogue: "未知の深海に到達したとは…深海の魔魚に気をつけろ。",
      choices: [
        {
          text: "探索を続ける",
          rewards: [
            { type: "flag", flag: "reached_deep_sea" },
            { type: "exp", exp: 600 },
          ],
        },
      ],
    },
    repeatable: false,
  },

  // === 第六章: 天空への道 ===
  {
    id: "evt-060",
    name: "天空聖殿への入り口",
    description: "天空聖殿へ向かう",
    chapter: 6,
    mapId: "map-006",
    position: { row: 18, col: 10 },
    trigger: "step",
    conditions: [
      { type: "flag", flag: "reached_celestial_sanctuary", value: true },
      { type: "flag", flag: "visited_sky_temple", value: false },
    ],
    data: {
      type: "conversation",
      npcId: "snpc-012",
      dialogue: "神の加護があらんことを。",
      choices: [
        {
          text: "天空聖殿へ進む",
          rewards: [
            { type: "flag", flag: "visited_sky_temple" },
          ],
        },
      ],
    },
    repeatable: false,
  },
  {
    id: "evt-061",
    name: "光の聖域へ",
    description: "光の聖域へ到達",
    chapter: 6,
    mapId: "map-015",
    position: { row: 5, col: 6 },
    trigger: "interact",
    conditions: [
      { type: "flag", flag: "visited_sky_temple", value: true },
      { type: "flag", flag: "reached_light_sanctuary", value: false },
    ],
    data: {
      type: "conversation",
      npcId: "snpc-012",
      dialogue: "光の聖域に到達したとは…光の天使との戦いに備えよ。",
      choices: [
        {
          text: "光の聖域へ進む",
          rewards: [
            { type: "flag", flag: "reached_light_sanctuary" },
            { type: "equipment", itemId: "eq-039", quantity: 1 },
          ],
        },
      ],
    },
    repeatable: false,
  },

  // === 第七章: 氷の深淵 ===
  {
    id: "evt-070",
    name: "氷の魔窟への入り口",
    description: "氷の魔窟へ向かう",
    chapter: 7,
    mapId: "map-003",
    position: { row: 1, col: 1 },
    trigger: "step",
    conditions: [
      { type: "flag", flag: "defeated_water_dragon", value: true },
      { type: "flag", flag: "visited_ice_cavern", value: false },
    ],
    data: {
      type: "conversation",
      npcId: "snpc-013",
      dialogue: "凍えた心にも灯を。氷の魔窟は危険だ。",
      choices: [
        {
          text: "氷の魔窟へ進む",
          rewards: [
            { type: "flag", flag: "visited_ice_cavern" },
            { type: "equipment", itemId: "eq-037", quantity: 1 },
          ],
        },
      ],
    },
    repeatable: false,
  },
  {
    id: "evt-071",
    name: "氷雪神殿へ",
    description: "氷雪神殿へ到達",
    chapter: 7,
    mapId: "map-018",
    position: { row: 5, col: 10 },
    trigger: "interact",
    conditions: [
      { type: "flag", flag: "visited_ice_cavern", value: true },
      { type: "flag", flag: "reached_ice_temple", value: false },
    ],
    data: {
      type: "conversation",
      npcId: "snpc-013",
      dialogue: "氷雪神殿に到達したとは…雪の女王との戦いに備えよ。",
      choices: [
        {
          text: "氷雪神殿へ進む",
          rewards: [
            { type: "flag", flag: "reached_ice_temple" },
            { type: "equipment", itemId: "eq-038", quantity: 1 },
          ],
        },
      ],
    },
    repeatable: false,
  },

  // === 第八章: 古代の神秘 ===
  {
    id: "evt-080",
    name: "毒の沼地へ",
    description: "毒の沼地へ向かう",
    chapter: 8,
    mapId: "map-004",
    position: { row: 18, col: 5 },
    trigger: "step",
    conditions: [
      { type: "flag", flag: "defeated_nine_tailed_fox", value: true },
      { type: "flag", flag: "visited_poison_swamp", value: false },
    ],
    data: {
      type: "conversation",
      npcId: "snpc-008",
      dialogue: "毒には毒を。備えておけ。",
      choices: [
        {
          text: "毒の沼地へ進む",
          rewards: [
            { type: "flag", flag: "visited_poison_swamp" },
          ],
        },
      ],
    },
    repeatable: false,
  },
  {
    id: "evt-081",
    name: "古代の神殿へ",
    description: "古代の神殿へ到達",
    chapter: 8,
    mapId: "map-017",
    position: { row: 11, col: 11 },
    trigger: "interact",
    conditions: [
      { type: "flag", flag: "visited_poison_swamp", value: true },
      { type: "flag", flag: "solved_ancient_mystery", value: false },
    ],
    data: {
      type: "conversation",
      npcId: "snpc-014",
      dialogue: "古代文明の謎を解き明かしたい…！",
      choices: [
        {
          text: "古代の神殿へ進む",
          rewards: [
            { type: "flag", flag: "solved_ancient_mystery" },
            { type: "exp", exp: 700 },
            { type: "equipment", itemId: "eq-021", quantity: 1 },
          ],
        },
      ],
    },
    repeatable: false,
  },

  // === 終章: 闇と光の戦い ===
  {
    id: "evt-090",
    name: "アビスの奈落へ",
    description: "アビスの奈落へ向かう",
    chapter: 9,
    mapId: "map-002",
    position: { row: 19, col: 19 },
    trigger: "step",
    conditions: [
      { type: "flag", flag: "found_ancient_ruins", value: true },
      { type: "flag", flag: "visited_abyss", value: false },
    ],
    data: {
      type: "conversation",
      npcId: "snpc-004",
      dialogue: "アビスの奈落は底の見えない地下迷宮。闇の魔物が巣食う。",
      choices: [
        {
          text: "アビスへ進む",
          rewards: [
            { type: "flag", flag: "visited_abyss" },
          ],
        },
      ],
    },
    repeatable: false,
  },
  {
    id: "evt-091",
    name: "魔王城へ",
    description: "魔王城へ到達",
    chapter: 9,
    mapId: "map-010",
    position: { row: 11, col: 8 },
    trigger: "interact",
    conditions: [
      { type: "flag", flag: "visited_abyss", value: true },
      { type: "flag", flag: "reached_demon_castle", value: false },
    ],
    data: {
      type: "conversation",
      npcId: "snpc-015",
      dialogue: "引き返すなら今のうちだ。ここより先は魔王の領域だ。",
      choices: [
        {
          text: "魔王城へ進む",
          rewards: [
            { type: "flag", flag: "reached_demon_castle" },
            { type: "equipment", itemId: "eq-041", quantity: 1 },
          ],
        },
      ],
    },
    repeatable: false,
  },
  {
    id: "evt-092",
    name: "魔王との戦い",
    description: "魔王と戦う",
    chapter: 9,
    mapId: "map-010",
    position: { row: 15, col: 10 },
    trigger: "step",
    conditions: [
      { type: "flag", flag: "reached_demon_castle", value: true },
      { type: "flag", flag: "defeated_demon_king", value: false },
    ],
    data: {
      type: "battle",
      enemyIds: ["e-052", "e-051", "e-051", "e-050"],
      winRewards: [
        { type: "flag", flag: "defeated_demon_king" },
        { type: "exp", exp: 1000 },
        { type: "gold", gold: 1000 },
        { type: "equipment", itemId: "eq-042", quantity: 1 },
      ],
    },
    repeatable: false,
    nextEventId: "evt-093",
  },
  {
    id: "evt-093",
    name: "闇の神殿へ",
    description: "闇の神殿へ到達",
    chapter: 9,
    mapId: "map-016",
    position: { row: 10, col: 10 },
    trigger: "interact",
    conditions: [
      { type: "flag", flag: "defeated_demon_king", value: true },
      { type: "flag", flag: "reached_dark_temple", value: false },
    ],
    data: {
      type: "conversation",
      npcId: "snpc-016",
      dialogue: "ここより先は闇の支配域。覚悟を決めて進め。",
      choices: [
        {
          text: "闇の神殿へ進む",
          rewards: [
            { type: "flag", flag: "reached_dark_temple" },
          ],
        },
      ],
    },
    repeatable: false,
  },
  {
    id: "evt-094",
    name: "闇の大魔神との戦い",
    description: "闇の大魔神と戦う（最終決戦）",
    chapter: 9,
    mapId: "map-016",
    position: { row: 15, col: 10 },
    trigger: "step",
    conditions: [
      { type: "flag", flag: "reached_dark_temple", value: true },
      { type: "flag", flag: "defeated_dark_god", value: false },
    ],
    data: {
      type: "battle",
      enemyIds: ["e-059", "e-060", "e-070", "e-071"],
      winRewards: [
        { type: "flag", flag: "defeated_dark_god" },
        { type: "flag", flag: "game_cleared" },
        { type: "exp", exp: 2000 },
        { type: "gold", gold: 5000 },
      ],
    },
    repeatable: false,
  },
  {
    id: "evt-095",
    name: "エンディング",
    description: "ゲームクリア",
    chapter: 9,
    mapId: "map-016",
    position: { row: 10, col: 10 },
    trigger: "interact",
    conditions: [
      { type: "flag", flag: "defeated_dark_god", value: true },
    ],
    data: {
      type: "conversation",
      npcId: "snpc-016",
      dialogue: "闇の大魔神を倒したとは…君は真の救世主だ！世界に平和が戻りました！",
      choices: [
        {
          text: "ありがとう！",
        },
      ],
    },
    repeatable: false,
  },
];

export const STORY_EVENT_MAP: Record<string, StoryEvent> = Object.fromEntries(
  STORY_EVENT_MASTER.map((evt) => [evt.id, evt])
);

export const getEventsByMap = (mapId: string): StoryEvent[] => {
  return STORY_EVENT_MASTER.filter((evt) => evt.mapId === mapId);
};

export const getEventsByChapter = (chapter: number): StoryEvent[] => {
  return STORY_EVENT_MASTER.filter((evt) => evt.chapter === chapter);
};
