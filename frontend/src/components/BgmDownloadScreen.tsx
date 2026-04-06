import { useEffect, useState } from "react";
import { Box, Typography, LinearProgress, CircularProgress } from "@mui/material";
import { BGM_TRACKS } from "../data/masters/bgmMaster";
import { getMissingBgmIds, downloadAndCacheBgm } from "../db/bgmService";

interface Props {
  onComplete: () => void;
}

export default function BgmDownloadScreen({ onComplete }: Props) {
  const [checking, setChecking] = useState(true);
  const [total,    setTotal]    = useState(0);
  const [done,     setDone]     = useState(0);
  const [current,  setCurrent]  = useState("");
  const [filePct,  setFilePct]  = useState(0); // 現ファイルの進捗 0〜1

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      // キャッシュ未済ファイルを確認
      const allIds = BGM_TRACKS.map((t) => t.id);
      const missing = await getMissingBgmIds(allIds);

      if (cancelled) return;
      if (missing.length === 0) {
        onComplete();
        return;
      }

      setChecking(false);
      setTotal(missing.length);

      for (let i = 0; i < missing.length; i++) {
        if (cancelled) return;
        const id  = missing[i]!;
        const url = BGM_TRACKS.find((t) => t.id === id)!.url;
        setCurrent(id);
        setFilePct(0);

        await downloadAndCacheBgm(id, url, (pct) => {
          if (!cancelled) setFilePct(pct);
        });

        setDone(i + 1);
      }

      if (!cancelled) onComplete();
    };

    run().catch(console.error);
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const overallPct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        backgroundImage: "radial-gradient(ellipse at center, #1a1a3e 0%, #0d0d1a 70%)",
      }}
    >
      <Box sx={{ width: 340, textAlign: "center", px: 2 }}>
        <Typography variant="h4" sx={{ mb: 1.5, color: "primary.main" }}>⚔</Typography>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
          Guild Owner RPG
        </Typography>

        {checking ? (
          <>
            <CircularProgress size={28} sx={{ mt: 3, mb: 1.5 }} />
            <Typography variant="body2" color="text.secondary">
              データを確認しています…
            </Typography>
          </>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              BGM データをダウンロードしています
            </Typography>

            {/* 全体進捗バー */}
            <LinearProgress
              variant="determinate"
              value={overallPct}
              sx={{
                height: 8, borderRadius: 4, mb: 1,
                bgcolor: "rgba(255,255,255,0.08)",
                "& .MuiLinearProgress-bar": { bgcolor: "primary.main", borderRadius: 4 },
              }}
            />
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                {done} / {total} ファイル
              </Typography>
              <Typography variant="caption" color="primary.light" fontWeight={700}>
                {overallPct}%
              </Typography>
            </Box>

            {/* 現ファイルの進捗バー */}
            {current && (
              <>
                <LinearProgress
                  variant={filePct > 0 ? "determinate" : "indeterminate"}
                  value={filePct * 100}
                  sx={{
                    height: 4, borderRadius: 2, mb: 0.75,
                    bgcolor: "rgba(255,255,255,0.06)",
                    "& .MuiLinearProgress-bar": { bgcolor: "secondary.main", borderRadius: 2 },
                  }}
                />
                <Typography variant="caption" color="text.disabled" noWrap>
                  🎵 {current}
                </Typography>
              </>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}
