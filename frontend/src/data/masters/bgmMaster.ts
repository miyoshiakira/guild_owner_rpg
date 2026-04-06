// Vite が各 MP3 を静的アセット URL として解決する
import bgm_battle1     from "../bgm/バトル1.mp3";
import bgm_battle2     from "../bgm/バトル2.mp3";
import bgm_ancient     from "../bgm/古代神殿.mp3";
import bgm_sky1        from "../bgm/天空1.mp3";
import bgm_sky2        from "../bgm/天空2.mp3";
import bgm_abyss       from "../bgm/奈落1.mp3";
import bgm_forest      from "../bgm/森1.mp3";
import bgm_ice1        from "../bgm/氷1.mp3";
import bgm_ice2        from "../bgm/氷2.mp3";
import bgm_seatemple   from "../bgm/海底神殿.mp3";
import bgm_volcano1    from "../bgm/火山1.mp3";
import bgm_volcano2    from "../bgm/火山2.mp3";
import bgm_desert1     from "../bgm/砂漠1.mp3";
import bgm_desert2     from "../bgm/砂漠2.mp3";
import bgm_grassland1  from "../bgm/草原1.mp3";
import bgm_grassland2  from "../bgm/草原2.mp3";
import bgm_darktemple  from "../bgm/闇の神殿1.mp3";
import bgm_snow1       from "../bgm/雪原1.mp3";
import bgm_snow2       from "../bgm/雪原2.mp3";
import bgm_demon       from "../bgm/魔王城1.mp3";

export interface BgmTrack {
  id: string;   // IndexedDB キー兼識別子
  label: string;
  url: string;  // Vite アセット URL（fetch 用）
}

/** 全 BGM トラック一覧 */
export const BGM_TRACKS: BgmTrack[] = [
  { id: "バトル1",   label: "バトル1",   url: bgm_battle1    },
  { id: "バトル2",   label: "バトル2",   url: bgm_battle2    },
  { id: "古代神殿",  label: "古代神殿",  url: bgm_ancient    },
  { id: "天空1",     label: "天空1",     url: bgm_sky1       },
  { id: "天空2",     label: "天空2",     url: bgm_sky2       },
  { id: "奈落1",     label: "奈落1",     url: bgm_abyss      },
  { id: "森1",       label: "森1",       url: bgm_forest     },
  { id: "氷1",       label: "氷1",       url: bgm_ice1       },
  { id: "氷2",       label: "氷2",       url: bgm_ice2       },
  { id: "海底神殿",  label: "海底神殿",  url: bgm_seatemple  },
  { id: "火山1",     label: "火山1",     url: bgm_volcano1   },
  { id: "火山2",     label: "火山2",     url: bgm_volcano2   },
  { id: "砂漠1",     label: "砂漠1",     url: bgm_desert1    },
  { id: "砂漠2",     label: "砂漠2",     url: bgm_desert2    },
  { id: "草原1",     label: "草原1",     url: bgm_grassland1 },
  { id: "草原2",     label: "草原2",     url: bgm_grassland2 },
  { id: "闇の神殿1", label: "闇の神殿1", url: bgm_darktemple },
  { id: "雪原1",     label: "雪原1",     url: bgm_snow1      },
  { id: "雪原2",     label: "雪原2",     url: bgm_snow2      },
  { id: "魔王城1",   label: "魔王城1",   url: bgm_demon      },
];

/** id → URL のクイックルックアップ */
export const BGM_URL_MAP: Record<string, string> = Object.fromEntries(
  BGM_TRACKS.map((t) => [t.id, t.url])
);

/** バトル BGM ID */
export const BATTLE_BGM_ID = "バトル1";

/** マップ ID → BGM ID */
export const MAP_BGM: Record<string, string> = {
  "map-001": "草原1",      // エルダリア平原
  "map-002": "砂漠1",      // カルダ砂漠
  "map-003": "雪原1",      // フロストハイム雪原
  "map-004": "森1",        // ミルウッドの深森
  "map-005": "火山1",      // ヴォルカノス火山帯
  "map-006": "天空1",      // セレスティア聖域
  "map-007": "奈落1",      // アビスの奈落
  "map-008": "海底神殿",   // 海底神殿
  "map-009": "天空2",      // 天空聖殿
  "map-010": "魔王城1",    // 魔王城
  "map-011": "森1",        // 毒の沼地
  "map-012": "氷1",        // 氷の魔窟
  "map-013": "火山2",      // 竜の棲み処
  "map-014": "海底神殿",   // 深海の底
  "map-015": "天空1",      // 光の聖域
  "map-016": "闇の神殿1",  // 闇の神殿
  "map-017": "古代神殿",   // 古代の神殿
  "map-018": "氷2",        // 氷雪神殿
};
