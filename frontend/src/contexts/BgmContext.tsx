import {
  createContext, useContext, useRef, useState, useCallback,
  useEffect, type ReactNode,
} from "react";
import { getBgmBuffer } from "../db/bgmService";

// ── ローカルストレージキー ──────────────────────────────────────────────────
const LS_VOLUME = "bgm_volume";
const LS_MUTED  = "bgm_muted";

function loadVolume(): number {
  const v = parseFloat(localStorage.getItem(LS_VOLUME) ?? "0.7");
  return isNaN(v) ? 0.7 : Math.max(0, Math.min(1, v));
}
function loadMuted(): boolean {
  return localStorage.getItem(LS_MUTED) === "true";
}

// ── BGM プレイヤー（React の外側のシングルトン） ───────────────────────────
class BgmPlayer {
  private audio: HTMLAudioElement | null = null;
  private blobUrlCache = new Map<string, string>(); // trackId → ObjectURL
  private currentId: string | null = null;

  async play(trackId: string, volume: number, muted: boolean): Promise<void> {
    // 既に同じトラックが再生中なら何もしない
    if (this.currentId === trackId && this.audio && !this.audio.paused) return;

    const buf = await getBgmBuffer(trackId);
    if (!buf) {
      console.warn(`BGM not cached: ${trackId}`);
      return;
    }

    // Blob URL をキャッシュして使い回す
    if (!this.blobUrlCache.has(trackId)) {
      const blob = new Blob([buf], { type: "audio/mpeg" });
      this.blobUrlCache.set(trackId, URL.createObjectURL(blob));
    }
    const url = this.blobUrlCache.get(trackId)!;

    // 前の音源を停止
    if (this.audio) {
      this.audio.pause();
      this.audio.src = "";
    }

    const audio = new Audio(url);
    audio.loop   = true;
    audio.volume = muted ? 0 : volume;
    this.audio     = audio;
    this.currentId = trackId;

    try {
      await audio.play();
    } catch {
      // autoplay ポリシーでブロックされた場合は無視（ユーザー操作後に再試行）
    }
  }

  stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.src = "";
      this.audio = null;
    }
    this.currentId = null;
  }

  setVolume(v: number, muted: boolean): void {
    if (this.audio) this.audio.volume = muted ? 0 : Math.max(0, Math.min(1, v));
  }

  getCurrentId(): string | null {
    return this.currentId;
  }
}

const player = new BgmPlayer();

// ── React Context ─────────────────────────────────────────────────────────────
interface BgmContextValue {
  volume: number;
  muted: boolean;
  currentTrack: string | null;
  setVolume: (v: number) => void;
  setMuted:  (m: boolean) => void;
  play:      (trackId: string) => void;
  stop:      () => void;
}

const BgmContext = createContext<BgmContextValue | null>(null);

export function BgmProvider({ children }: { children: ReactNode }) {
  const [volume, setVolumeState] = useState<number>(loadVolume);
  const [muted,  setMutedState]  = useState<boolean>(loadMuted);
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);

  // ref で最新値を保持（コールバック内で stale closure を防ぐ）
  const volumeRef = useRef(volume);
  const mutedRef  = useRef(muted);
  useEffect(() => { volumeRef.current = volume; }, [volume]);
  useEffect(() => { mutedRef.current  = muted;  }, [muted]);

  const setVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(1, v));
    setVolumeState(clamped);
    localStorage.setItem(LS_VOLUME, String(clamped));
    player.setVolume(clamped, mutedRef.current);
  }, []);

  const setMuted = useCallback((m: boolean) => {
    setMutedState(m);
    localStorage.setItem(LS_MUTED, String(m));
    player.setVolume(volumeRef.current, m);
  }, []);

  const play = useCallback((trackId: string) => {
    setCurrentTrack(trackId);
    player.play(trackId, volumeRef.current, mutedRef.current);
  }, []);

  const stop = useCallback(() => {
    setCurrentTrack(null);
    player.stop();
  }, []);

  return (
    <BgmContext.Provider value={{ volume, muted, currentTrack, setVolume, setMuted, play, stop }}>
      {children}
    </BgmContext.Provider>
  );
}

export function useBgm(): BgmContextValue {
  const ctx = useContext(BgmContext);
  if (!ctx) throw new Error("useBgm must be used within BgmProvider");
  return ctx;
}
