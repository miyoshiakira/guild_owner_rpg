import { useState, useMemo } from "react";
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
  TextField,
  InputAdornment,
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
  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredRecipes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return CRAFT_RECIPE_MASTER;
    return CRAFT_RECIPE_MASTER.filter((recipe) => {
      if (recipe.name.toLowerCase().includes(q)) return true;
      if (recipe.description.toLowerCase().includes(q)) return true;
      if (recipe.result.name.toLowerCase().includes(q)) return true;
      return recipe.ingredients.some((ing) => {
        const mat = MATERIAL_MAP[ing.materialId];
        return mat && mat.name.toLowerCase().includes(q);
      });
    });
  }, [searchQuery]);

  return (
    <Box sx={{ width: "100%", p: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <Typography variant="h4" sx={{ flexShrink: 0 }}>
          クラフト
        </Typography>
        <TextField
          size="small"
          placeholder="レシピ・素材名で検索…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ flexGrow: 1, maxWidth: 320 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Typography sx={{ fontSize: 16, lineHeight: 1 }}>🔍</Typography>
              </InputAdornment>
            ),
            endAdornment: searchQuery ? (
              <InputAdornment position="end">
                <Button
                  size="small"
                  onClick={() => setSearchQuery("")}
                  sx={{ minWidth: 0, p: 0.25, color: "text.secondary", fontSize: 16 }}
                >
                  ✕
                </Button>
              </InputAdornment>
            ) : null,
          }}
        />
        {searchQuery && (
          <Typography variant="caption" color="text.secondary">
            {filteredRecipes.length} 件
          </Typography>
        )}
      </Box>

      {filteredRecipes.length === 0 && (
        <Box sx={{ textAlign: "center", py: 6, color: "text.secondary" }}>
          <Typography variant="h5" sx={{ mb: 1 }}>🔍</Typography>
          <Typography>「{searchQuery}」に一致するレシピが見つかりません</Typography>
        </Box>
      )}

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
        {filteredRecipes.map((recipe) => {
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
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
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
          {selectedRecipe && (
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
                <Typography variant="h3" lineHeight={1}>{selectedRecipe.emoji}</Typography>
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    {selectedRecipe.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedRecipe.description}
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
                  {selectedRecipe.ingredients.map((ingredient, idx) => {
                    const material = MATERIAL_MAP[ingredient.materialId];
                    const status = getIngredientStatus(ingredient.materialId, ingredient.qty);
                    return (
                      <ListItem
                        key={ingredient.materialId}
                        sx={{
                          borderBottom:
                            idx < selectedRecipe.ingredients.length - 1
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
                  {selectedRecipe.result.sprite}
                </Typography>
                <Box>
                  <Typography variant="body1" fontWeight={700}>
                    {selectedRecipe.result.name}
                    {selectedRecipe.resultQty > 1 && (
                      <Typography component="span" color="secondary.main" ml={0.5}>
                        x{selectedRecipe.resultQty}
                      </Typography>
                    )}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedRecipe.result.effect}
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
            onClick={handleDialogClose}
            sx={{ color: "text.secondary" }}
          >
            キャンセル
          </Button>
          <Button
            onClick={handleCraftConfirm}
            variant="contained"
            sx={{ px: 3, fontWeight: 700 }}
          >
            作成する
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
