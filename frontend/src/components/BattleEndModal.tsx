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
import { useGame } from "../store/gameStore";
import { MATERIAL_MAP } from "../data/masters/materialMaster";

interface BattleEndModalProps {
  open: boolean;
  victory: boolean;
  rewards?: {
    gold: number;
    exp: number;
    materials: Record<string, number>;
    levelUps: Array<{
      monsterId: string;
      monsterName: string;
      fromLevel: number;
      toLevel: number;
    }>;
  };
  onClose: () => void;
}

export default function BattleEndModal({ open, victory, rewards, onClose }: BattleEndModalProps) {
  const { dispatch } = useGame();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (!open) {
      // Reset animation states when closed
      setShowContent(false);
      return;
    }

    // Show content (delay 500ms)
    const timer = window.setTimeout(() => {
      setShowContent(true);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [open]);

  const handleClose = () => {
    if (victory && rewards) {
      // Apply rewards to game state
      dispatch({ type: "UPDATE_PLAYER", payload: { 
        gold: rewards.gold,
        exp: rewards.exp 
      }});
      
      dispatch({ type: "ADD_MATERIALS", payload: rewards.materials });

      // Apply level ups
      rewards.levelUps.forEach(levelUp => {
        dispatch({ type: "LEVEL_UP_MONSTER", payload: { monsterId: levelUp.monsterId } });
      });
    }

    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 500,
        },
      }}
    >
      <Fade in={open}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: 500 },
          maxHeight: '90vh',
          overflow: 'auto',
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
        }}>
          <Typography 
            variant="h4" 
            textAlign="center" 
            color={victory ? "primary" : "error"} 
            gutterBottom
          >
            {victory ? "戦闘勝利！" : "全滅・・・"}
          </Typography>

          {victory && rewards && (
            <Fade in={showContent} timeout={800}>
              <Box>
                {/* Gold */}
                <Fade in={showContent} timeout={800}>
                  <Box sx={{ mb: 3 }}>
                    <Card sx={{ bgcolor: "warning.main", color: "warning.contrastText" }}>
                      <CardContent sx={{ textAlign: "center", py: 2 }}>
                        <Typography variant="h6" gutterBottom>
                          💰 所持金
                        </Typography>
                        <Typography variant="h4">
                          +{rewards.gold} G
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>
                </Fade>

                {/* EXP */}
                <Fade in={showContent} timeout={800}>
                  <Box sx={{ mb: 3 }}>
                    <Card sx={{ bgcolor: "secondary.main", color: "secondary.contrastText" }}>
                      <CardContent sx={{ textAlign: "center", py: 2 }}>
                        <Typography variant="h6" gutterBottom>
                          ⭐ 経験値
                        </Typography>
                        <Typography variant="h4">
                          +{rewards.exp} EXP
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>
                </Fade>

                {/* Materials */}
                {Object.keys(rewards.materials).length > 0 && (
                  <Fade in={showContent} timeout={800}>
                    <Box sx={{ mb: 3 }}>
                      <Card sx={{ bgcolor: "success.main", color: "success.contrastText" }}>
                        <CardContent sx={{ textAlign: "center", py: 2 }}>
                          <Typography variant="h6" gutterBottom>
                            🎁 獲得素材
                          </Typography>
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
                  </Fade>
                )}

                {/* Level Ups */}
                {rewards.levelUps.length > 0 && (
                  <Fade in={showContent} timeout={800}>
                    <Box sx={{ mb: 3 }}>
                      <Card sx={{ bgcolor: "primary.main", color: "primary.contrastText" }}>
                        <CardContent sx={{ textAlign: "center", py: 2 }}>
                          <Typography variant="h6" gutterBottom>
                            🎉 レベルアップ！
                          </Typography>
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
                  </Fade>
                )}

                {/* Progress indicator */}
                <Box sx={{ mt: 3, textAlign: "center" }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={showContent ? 100 : 0} 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                    {showContent ? "結果確認完了" : "結果確認中..."}
                  </Typography>
                </Box>
              </Box>
            </Fade>
          )}

          {!victory && (
            <Fade in={showContent} timeout={800}>
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  力及ばずでした...また挑戦しましょう！
                </Typography>
                
                <Box sx={{ mt: 3, textAlign: "center" }}>
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
          )}

          {/* Action Button */}
          <Box sx={{ mt: 4, textAlign: "center" }}>
            <Button 
              onClick={handleClose} 
              variant="contained" 
              size="large"
              disabled={!showContent}
              color={victory ? "primary" : "error"}
              sx={{ minWidth: 200 }}
            >
              {victory ? "フィールドへ戻る" : "ギルドへ戻る"}
            </Button>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
}
