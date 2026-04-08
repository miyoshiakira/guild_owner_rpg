import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
} from "@mui/material";
import { MATERIAL_MAP } from "../../data/masters/materialMaster";
import type { CraftRecipe } from "../../types/masters";

export interface CraftConfirmDialogProps {
  open: boolean;
  recipe: CraftRecipe | null;
  materials: Record<string, number>;
  onClose: () => void;
  onConfirm: () => void;
}

export default function CraftConfirmDialog({
  open,
  recipe,
  materials,
  onClose,
  onConfirm,
}: CraftConfirmDialogProps) {
  const getIngredientStatus = (materialId: string, requiredQty: number) => {
    const currentQty = materials[materialId] || 0;
    return {
      hasEnough: currentQty >= requiredQty,
      current: currentQty,
      required: requiredQty,
    };
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: "background.paper",
          border: "1px solid rgba(124,77,255,0.3)",
          borderRadius: 2,
          backgroundImage: "none",
        },
      }}
    >
      <DialogTitle
        sx={{
          borderBottom: "1px solid rgba(124,77,255,0.2)",
          pb: 1.5,
          display: "flex",
          alignItems: "center",
          gap: 1,
          fontWeight: 700,
          color: "primary.light",
        }}
      >
        ⚒️ クラフト確認
      </DialogTitle>
      <DialogContent sx={{ pt: 2.5 }}>
        {recipe && (
          <Box>
            {/* アイテム名 */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                mb: 2.5,
              }}
            >
              <Typography variant="h3" lineHeight={1}>{recipe.emoji}</Typography>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {recipe.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {recipe.description}
                </Typography>
              </Box>
            </Box>

            {/* 消費素材 */}
            <Typography
              variant="subtitle2"
              sx={{ color: "text.secondary", mb: 1, textTransform: "uppercase", letterSpacing: 1, fontSize: "0.7rem" }}
            >
              消費素材
            </Typography>
            <Box
              sx={{
                bgcolor: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 1.5,
                mb: 2.5,
                overflow: "hidden",
              }}
            >
              <List dense disablePadding>
                {recipe.ingredients.map((ingredient, idx) => {
                  const material = MATERIAL_MAP[ingredient.materialId];
                  const status = getIngredientStatus(ingredient.materialId, ingredient.qty);
                  return (
                    <ListItem
                      key={ingredient.materialId}
                      sx={{
                        borderBottom:
                          idx < recipe.ingredients.length - 1
                            ? "1px solid rgba(255,255,255,0.06)"
                            : "none",
                        py: 1,
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <Typography variant="h5" lineHeight={1}>{material.emoji}</Typography>
                      </ListItemIcon>
                      <ListItemText
                        primary={material.name}
                        secondary={`必要: ${ingredient.qty}`}
                        primaryTypographyProps={{ fontWeight: 600, fontSize: "0.95rem" }}
                        secondaryTypographyProps={{ fontSize: "0.75rem" }}
                      />
                      <Chip
                        label={`${status.current} / ${status.required}`}
                        size="small"
                        color={status.hasEnough ? "success" : "error"}
                        sx={{ fontWeight: 700, fontSize: "0.75rem" }}
                      />
                    </ListItem>
                  );
                })}
              </List>
            </Box>

            {/* 作成結果 */}
            <Typography
              variant="subtitle2"
              sx={{ color: "text.secondary", mb: 1, textTransform: "uppercase", letterSpacing: 1, fontSize: "0.7rem" }}
            >
              作成結果
            </Typography>
            <Box
              sx={{
                bgcolor: "rgba(124,77,255,0.1)",
                border: "1px solid rgba(124,77,255,0.3)",
                borderRadius: 1.5,
                p: 2,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <Typography variant="h4" lineHeight={1}>
                {recipe.result.sprite}
              </Typography>
              <Box>
                <Typography variant="body1" fontWeight={700}>
                  {recipe.result.name}
                  {recipe.resultQty > 1 && (
                    <Typography component="span" color="secondary.main" ml={0.5}>
                      x{recipe.resultQty}
                    </Typography>
                  )}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {recipe.result.effect}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions
        sx={{
          borderTop: "1px solid rgba(124,77,255,0.2)",
          px: 3,
          py: 1.5,
          gap: 1,
        }}
      >
        <Button
          onClick={onClose}
          sx={{ color: "text.secondary" }}
        >
          キャンセル
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          sx={{ px: 3, fontWeight: 700 }}
        >
          作成する
        </Button>
      </DialogActions>
    </Dialog>
  );
}
