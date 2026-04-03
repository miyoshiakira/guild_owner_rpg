import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  LinearProgress,
  Fade,
  Modal,
  Backdrop,
} from "@mui/material";
import type { BattleRewards } from "../types/game";
import { MATERIAL_MAP } from "../data/masters/materialMaster";

type BattleEndReason = "victory" | "defeat" | "run" | "scout";

interface BattleEndModalProps {
  open: boolean;
  victory: boolean;
  endReason: BattleEndReason;
  rewards?: BattleRewards;
  onClose: () => void;
}

const TITLE: Record<BattleEndReason, string> = {
  victory: "戦闘勝利！",
  defeat:  "全滅・・・",
  run:     "逃げ出した...",
  scout:   "スカウト成功！",
};

const MESSAGE: Record<Exclude<BattleEndReason, "victory">, string> = {
  defeat: "力及ばずでした...また挑戦しましょう！",
  run:    "今回は退散！また挑戦しましょう！",
  scout:  "仲間になった！ギルドで確認してみよう！",
};

const TITLE_COLOR: Record<BattleEndReason, string> = {
  victory: "primary.main",
  defeat:  "error.main",
  run:     "text.secondary",
  scout:   "success.main",
};

export default function BattleEndModal({ open, victory, endReason, rewards, onClose }: BattleEndModalProps) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (!open) {
      setShowContent(false);
      return;
    }
    const timer = window.setTimeout(() => setShowContent(true), 500);
    return () => clearTimeout(timer);
  }, [open]);

  return (
    <Modal
      open={open}
      slots={{ backdrop: Backdrop }}
      slotProps={{ backdrop: { timeout: 500 } }}
    >
      <Fade in={open}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: 500 },
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          overflow: 'hidden',
        }}>
          {/* タイトル (固定) */}
          <Box sx={{ px: 4, pt: 4, pb: 1, flexShrink: 0 }}>
            <Typography
              variant="h4"
              textAlign="center"
              sx={{ color: TITLE_COLOR[endReason] }}
            >
              {TITLE[endReason]}
            </Typography>
          </Box>

          {/* スクロール可能なコンテンツ */}
          <Box sx={{ flex: 1, overflowY: 'auto', px: 4, py: 2 }}>
            <Fade in={showContent} timeout={800}>
              <Box>
                {victory && rewards ? (
                  <>
                    {/* Gold */}
                    <Box sx={{ mb: 2 }}>
                      <Card sx={{ bgcolor: "warning.main", color: "warning.contrastText" }}>
                        <CardContent sx={{ textAlign: "center", py: 2 }}>
                          <Typography variant="h6" gutterBottom>💰 所持金</Typography>
                          <Typography variant="h4">+{rewards.gold} G</Typography>
                        </CardContent>
                      </Card>
                    </Box>

                    {/* EXP */}
                    <Box sx={{ mb: 2 }}>
                      <Card sx={{ bgcolor: "secondary.main", color: "secondary.contrastText" }}>
                        <CardContent sx={{ textAlign: "center", py: 2 }}>
                          <Typography variant="h6" gutterBottom>⭐ 経験値</Typography>
                          <Typography variant="h4">+{rewards.exp} EXP</Typography>
                        </CardContent>
                      </Card>
                    </Box>

                    {/* Materials */}
                    {Object.keys(rewards.materials).length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Card sx={{ bgcolor: "success.main", color: "success.contrastText" }}>
                          <CardContent sx={{ textAlign: "center", py: 2 }}>
                            <Typography variant="h6" gutterBottom>🎁 獲得素材</Typography>
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "center" }}>
                              {Object.entries(rewards.materials).map(([materialId, qty]) => {
                                const material = MATERIAL_MAP[materialId];
                                return (
                                  <Box
                                    key={materialId}
                                    sx={{
                                      px: 1.5,
                                      py: 0.5,
                                      bgcolor: "rgba(255,255,255,0.2)",
                                      borderRadius: 1,
                                      fontSize: "0.875rem",
                                    }}
                                  >
                                    {material.emoji} {material.name} x{qty}
                                  </Box>
                                );
                              })}
                            </Box>
                          </CardContent>
                        </Card>
                      </Box>
                    )}

                    {/* Level Ups */}
                    {rewards.levelUps.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Card sx={{ bgcolor: "primary.main", color: "primary.contrastText" }}>
                          <CardContent sx={{ textAlign: "center", py: 2 }}>
                            <Typography variant="h6" gutterBottom>🎉 レベルアップ！</Typography>
                            {rewards.levelUps.map((levelUp) => (
                              <Box key={levelUp.monsterId} sx={{ mb: 1 }}>
                                <Typography variant="body1">
                                  {levelUp.monsterName}: Lv.{levelUp.fromLevel} → Lv.{levelUp.toLevel}
                                </Typography>
                              </Box>
                            ))}
                          </CardContent>
                        </Card>
                      </Box>
                    )}
                  </>
                ) : (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      {MESSAGE[endReason as Exclude<BattleEndReason, "victory">]}
                    </Typography>
                  </Box>
                )}

                {/* Progress indicator */}
                <Box sx={{ mt: 2, textAlign: "center" }}>
                  <LinearProgress
                    variant="determinate"
                    value={showContent ? 100 : 0}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                    {showContent ? "確認完了" : "確認中..."}
                  </Typography>
                </Box>
              </Box>
            </Fade>
          </Box>

          {/* 閉じるボタン (固定) */}
          <Box sx={{ px: 4, py: 3, flexShrink: 0, borderTop: "1px solid", borderColor: "divider", textAlign: "center" }}>
            <Button
              onClick={onClose}
              variant="contained"
              size="large"
              disabled={!showContent}
              color={victory ? "primary" : endReason === "scout" ? "success" : "error"}
              sx={{ minWidth: 200 }}
            >
              フィールドへ戻る
            </Button>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
}
