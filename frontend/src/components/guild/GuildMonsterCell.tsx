import { memo } from "react";
import {
  Box,
  Typography,
  Checkbox,
  LinearProgress,
} from "@mui/material";
import { SpriteImage } from "../SpriteImage";
import { TYPE_COLORS } from "./guildConstants";
import type { Monster } from "../../types/game";

export interface MonsterCellProps {
  monster: Monster;
  onClick: () => void;
  onToggleParty: (isParty: boolean) => void;
  /** 配合モード時の表示状態 */
  breedState?: "base" | "eligible" | "ineligible";
}

const MonsterCell = memo(function MonsterCell({
  monster, onClick, onToggleParty, breedState,
}: MonsterCellProps) {
  const isInBreedMode = breedState !== undefined;
  const isDisabled = breedState === "ineligible";
  const isBase = breedState === "base";

  return (
    <Box
      onClick={isDisabled ? undefined : onClick}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0.5,
        pb: 0.5,
        bgcolor: isBase ? "rgba(255,193,7,0.12)" : "background.paper",
        border: isBase
          ? "2px solid #ffc107"
          : "1px solid rgba(255,255,255,0.08)",
        borderTop: `3px solid ${TYPE_COLORS[monster.type] ?? "#7c4dff"}`,
        borderRadius: 2,
        cursor: isDisabled ? "not-allowed" : "pointer",
        position: "relative",
        userSelect: "none",
        opacity: isDisabled ? 0.38 : 1,
        transition: "transform 0.12s, box-shadow 0.12s",
        ...(!isDisabled && !isInBreedMode && {
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 6px 20px rgba(0,0,0,0.4)",
            borderColor: "rgba(124,77,255,0.5)",
          },
          "&:active": { transform: "scale(0.97)" },
        }),
        ...(!isDisabled && isInBreedMode && !isBase && {
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 6px 20px rgba(102,187,106,0.4)",
            borderColor: "rgba(102,187,106,0.7)",
          },
          "&:active": { transform: "scale(0.97)" },
        }),
      }}
    >
      {/* 配合ベース選択済みバッジ */}
      {isBase && (
        <Box sx={{
          position: "absolute", top: 4, right: 4, zIndex: 1,
          bgcolor: "#ffc107", borderRadius: "50%",
          width: 16, height: 16,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 10, fontWeight: 700, color: "#000",
        }}>
          ⚗
        </Box>
      )}
      {/* 画像エリア */}
      <Box sx={{ width: "100%", aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <SpriteImage sprite={monster.sprite} size={48} alt={monster.name} />
      </Box>

      <Typography variant="caption" fontWeight={700} sx={{ fontSize: { xs: 11, sm: 12 }, px: 0.5 }} noWrap>
        {monster.name}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
        Lv.{monster.level}
      </Typography>

      {/* HP/MPバー */}
      <Box sx={{ width: "100%", px: 0.75, display: "flex", flexDirection: "column", gap: 0.35 }}>
        <LinearProgress
          variant="determinate"
          value={monster.maxHp > 0 ? Math.min(100, (monster.hp / monster.maxHp) * 100) : 100}
          sx={{
            height: 3, borderRadius: 2,
            bgcolor: "rgba(255,255,255,0.1)",
            "& .MuiLinearProgress-bar": { bgcolor: "#ef5350", borderRadius: 2 },
          }}
        />
        {monster.maxMp > 0 && (
          <LinearProgress
            variant="determinate"
            value={Math.min(100, (monster.mp / monster.maxMp) * 100)}
            sx={{
              height: 3, borderRadius: 2,
              bgcolor: "rgba(255,255,255,0.1)",
              "& .MuiLinearProgress-bar": { bgcolor: "#42a5f5", borderRadius: 2 },
            }}
          />
        )}
      </Box>

      {/* 出撃チェックボックス */}
      <Box
        onClick={(e) => { e.stopPropagation(); onToggleParty(!monster.isParty); }}
        sx={{ display: "flex", alignItems: "center", mt: 0.25, cursor: "pointer" }}
      >
        <Checkbox
          checked={monster.isParty}
          size="small"
          color="success"
          disableRipple
          sx={{ p: 0.25 }}
        />
        <Typography
          variant="caption"
          sx={{ fontSize: 10, color: monster.isParty ? "success.main" : "text.disabled", lineHeight: 1 }}
        >
          出撃
        </Typography>
      </Box>
    </Box>
  );
});

export default MonsterCell;
