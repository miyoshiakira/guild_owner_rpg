import { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
} from "@mui/material";
import { useGame } from "../store/gameStore";
import { CRAFT_RECIPE_MASTER } from "../data/masters/craftRecipeMaster";
import { MATERIAL_MAP } from "../data/masters/materialMaster";
import type { CraftRecipe } from "../types/masters";

export default function CraftPage() {
  const { state, dispatch } = useGame();
  const { materials } = state;
  const [selectedRecipe, setSelectedRecipe] = useState<CraftRecipe | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const canCraft = (recipe: CraftRecipe): boolean => {
    return recipe.ingredients.every(
      (ingredient) => (materials[ingredient.materialId] || 0) >= ingredient.qty
    );
  };

  const getIngredientStatus = (materialId: string, requiredQty: number) => {
    const currentQty = materials[materialId] || 0;
    return {
      hasEnough: currentQty >= requiredQty,
      current: currentQty,
      required: requiredQty,
    };
  };

  const handleCraftClick = (recipe: CraftRecipe) => {
    setSelectedRecipe(recipe);
    setDialogOpen(true);
  };

  const handleCraftConfirm = () => {
    if (!selectedRecipe) return;

    // 素材を消費
    const materialsToConsume: Record<string, number> = {};
    selectedRecipe.ingredients.forEach((ingredient) => {
      materialsToConsume[ingredient.materialId] = ingredient.qty;
    });

    dispatch({ type: "ADD_MATERIALS", payload: Object.fromEntries(
      Object.entries(materialsToConsume).map(([id, qty]) => [id, -qty])
    )});

    // クラフト実行
    dispatch({ type: "CRAFT", payload: selectedRecipe });

    setDialogOpen(false);
    setSelectedRecipe(null);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedRecipe(null);
  };

  return (
    <Box sx={{ width: "100%", p: 2 }}>
      <Typography variant="h4" gutterBottom>
        クラフト
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
          },
          gap: 2,
        }}
      >
        {CRAFT_RECIPE_MASTER.map((recipe) => {
          const craftable = canCraft(recipe);
          return (
            <Card
              key={recipe.id}
              sx={{
                opacity: craftable ? 1 : 0.6,
                transition: "opacity 0.2s",
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <Typography variant="h4">{recipe.emoji}</Typography>
                  <Typography variant="h6">{recipe.name}</Typography>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {recipe.description}
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    必要素材:
                  </Typography>
                  {recipe.ingredients.map((ingredient) => {
                    const material = MATERIAL_MAP[ingredient.materialId];
                    const status = getIngredientStatus(ingredient.materialId, ingredient.qty);
                    return (
                      <Box
                        key={ingredient.materialId}
                        display="flex"
                        alignItems="center"
                        gap={1}
                        mb={0.5}
                      >
                        <Typography variant="body2">
                          {material.emoji} {material.name} x{ingredient.qty}
                        </Typography>
                        <Chip
                          label={`${status.current}/${status.required}`}
                          size="small"
                          color={status.hasEnough ? "success" : "error"}
                        />
                      </Box>
                    );
                  })}
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    作成結果:
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2">
                      {recipe.result.type === "equipment" ? (
                        <>
                          {recipe.result.sprite} {recipe.result.name} 
                          {recipe.resultQty > 1 && ` x${recipe.resultQty}`}
                        </>
                      ) : (
                        <>
                          {recipe.result.sprite} {recipe.result.name}
                          {recipe.resultQty > 1 && ` x${recipe.resultQty}`}
                        </>
                      )}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {recipe.result.type === "equipment" ? recipe.result.effect : recipe.result.effect}
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  disabled={!craftable}
                  onClick={() => handleCraftClick(recipe)}
                >
                  {craftable ? "作成する" : "素材不足"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {/* クラフト確認ダイアログ */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>クラフト確認</DialogTitle>
        <DialogContent>
          {selectedRecipe && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedRecipe.emoji} {selectedRecipe.name}
              </Typography>
              
              <Alert severity="info" sx={{ mb: 2 }}>
                以下の素材を消費してクラフトします
              </Alert>

              <List>
                {selectedRecipe.ingredients.map((ingredient) => {
                  const material = MATERIAL_MAP[ingredient.materialId];
                  return (
                    <ListItem key={ingredient.materialId}>
                      <ListItemIcon>
                        <Typography variant="h5">{material.emoji}</Typography>
                      </ListItemIcon>
                      <ListItemText
                        primary={material.name}
                        secondary={`x${ingredient.qty}`}
                      />
                    </ListItem>
                  );
                })}
              </List>

              <Box sx={{ mt: 2, p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  作成結果:
                </Typography>
                <Typography variant="body1">
                  {selectedRecipe.result.type === "equipment" ? (
                    <>
                      {selectedRecipe.result.sprite} {selectedRecipe.result.name}
                      {selectedRecipe.resultQty > 1 && ` x${selectedRecipe.resultQty}`}
                    </>
                  ) : (
                    <>
                      {selectedRecipe.result.sprite} {selectedRecipe.result.name}
                      {selectedRecipe.resultQty > 1 && ` x${selectedRecipe.resultQty}`}
                    </>
                  )}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>キャンセル</Button>
          <Button onClick={handleCraftConfirm} variant="contained">
            作成する
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
