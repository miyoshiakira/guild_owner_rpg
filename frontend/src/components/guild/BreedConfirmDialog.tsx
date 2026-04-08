import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
} from "@mui/material";
import { SpriteImage } from "../SpriteImage";
import type { Monster } from "../../types/game";

export interface BreedConfirmDialogProps {
  open: boolean;
  breedBase: Monster | null;
  breedPartner: Monster | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function BreedConfirmDialog({
  open,
  breedBase,
  breedPartner,
  onClose,
  onConfirm,
}: BreedConfirmDialogProps) {
  if (!breedBase || !breedPartner) return null;

  const combinedSkills = [...new Set([...breedBase.skills, ...breedPartner.skills])];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { borderRadius: 2, minWidth: 320, border: "1px solid rgba(255,193,7,0.4)" } }}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>⚗ 配合の確認</DialogTitle>
      <DialogContent sx={{ pt: "0 !important" }}>
        <Box>
          {/* 配合の組み合わせ */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1.5, mb: 2 }}>
            <Box sx={{ textAlign: "center" }}>
              <SpriteImage sprite={breedBase.sprite} size={48} alt={breedBase.name} />
              <Typography variant="caption" display="block" fontWeight={700}>{breedBase.name}</Typography>
              <Typography variant="caption" color="text.secondary">Lv.{breedBase.level}</Typography>
            </Box>
            <Typography variant="h6" color="warning.main">⚗</Typography>
            <Box sx={{ textAlign: "center" }}>
              <SpriteImage sprite={breedPartner.sprite} size={48} alt={breedPartner.name} />
              <Typography variant="caption" display="block" fontWeight={700}>{breedPartner.name}</Typography>
              <Typography variant="caption" color="text.secondary">Lv.{breedPartner.level}</Typography>
            </Box>
          </Box>

          {/* 配合後の変化 */}
          <Box sx={{ bgcolor: "rgba(255,193,7,0.06)", border: "1px solid rgba(255,193,7,0.25)", borderRadius: 1.5, p: 1.25, mb: 1.5 }}>
            <Typography variant="caption" color="warning.main" fontWeight={700} display="block" sx={{ mb: 0.75 }}>
              配合後の {breedBase.name}
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 0.75 }}>
              <Chip label="Lv1 にリセット" size="small" color="warning" variant="outlined" sx={{ height: 18, fontSize: 10 }} />
              <Chip label={`配合 ${(breedBase.breedCount ?? 0) + 1}回目`} size="small" sx={{ height: 18, fontSize: 10, bgcolor: "rgba(255,193,7,0.15)" }} />
              <Chip label={`性格: ${breedBase.personality} or ${breedPartner.personality}`} size="small" variant="outlined" sx={{ height: 18, fontSize: 10 }} />
            </Box>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
              配合後ステータス（ベースの½ + 相手の1/10）:
              HP {Math.max(1, Math.floor(breedBase.maxHp/2)+Math.floor(breedPartner.maxHp/10))} /
              ATK {Math.max(1, Math.floor(breedBase.atk/2)+Math.floor(breedPartner.atk/10))} /
              DEF {Math.max(1, Math.floor(breedBase.def/2)+Math.floor(breedPartner.def/10))} /
              SPD {Math.max(1, Math.floor(breedBase.spd/2)+Math.floor(breedPartner.spd/10))}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
              引き継ぎスキル（{combinedSkills.length}個）:
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.4 }}>
              {combinedSkills.map((sk) => (
                <Chip key={sk} label={sk} size="small" sx={{ height: 18, fontSize: 10, bgcolor: "rgba(124,77,255,0.15)" }} />
              ))}
            </Box>
          </Box>

          <Typography variant="caption" color="error">
            ※ {breedPartner.name} はギルドから消えます。{breedBase.name} はパーティから外れます。この操作は取り消せません。
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button onClick={onClose} sx={{ color: "text.secondary" }}>
          キャンセル
        </Button>
        <Button variant="contained" color="warning" onClick={onConfirm}>
          配合する
        </Button>
      </DialogActions>
    </Dialog>
  );
}
