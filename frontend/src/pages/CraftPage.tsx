import { useState, useMemo } from "react";
import { Box, Typography } from "@mui/material";
import { useGame } from "../store/gameStore";
import { CRAFT_RECIPE_MASTER } from "../data/masters/craftRecipeMaster";
import { MATERIAL_MAP } from "../data/masters/materialMaster";
import type { CraftRecipe } from "../types/masters";
import RecipeCard from "../components/craft/RecipeCard";
import CraftConfirmDialog from "../components/craft/CraftConfirmDialog";
import CraftSearchBar from "../components/craft/CraftSearchBar";

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
    let recipes = !q ? CRAFT_RECIPE_MASTER : CRAFT_RECIPE_MASTER.filter((recipe) => {
      if (recipe.name.toLowerCase().includes(q)) return true;
      if (recipe.description.toLowerCase().includes(q)) return true;
      if (recipe.result.name.toLowerCase().includes(q)) return true;
      return recipe.ingredients.some((ing) => {
        const mat = MATERIAL_MAP[ing.materialId];
        return mat && mat.name.toLowerCase().includes(q);
      });
    });
    
    // レシピ可能順にソート（可能なものを上に）
    return recipes.sort((a, b) => {
      const aCraftable = canCraft(a);
      const bCraftable = canCraft(b);
      
      // 可能なものを優先、不可能なものを後に
      if (aCraftable && !bCraftable) return -1;
      if (!aCraftable && bCraftable) return 1;
      
      // 両方可能または両方不可能の場合は名前順
      return a.name.localeCompare(b.name);
    });
  }, [searchQuery, materials]);

  return (
    <Box sx={{ width: "100%", p: 2 }}>
      <CraftSearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        resultCount={filteredRecipes.length}
      />

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
        {filteredRecipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            craftable={canCraft(recipe)}
            materials={materials}
            onClick={() => handleCraftClick(recipe)}
          />
        ))}
      </Box>

      {/* クラフト確認ダイアログ */}
      <CraftConfirmDialog
        open={dialogOpen}
        recipe={selectedRecipe}
        materials={materials}
        onClose={handleDialogClose}
        onConfirm={handleCraftConfirm}
      />
    </Box>
  );
}
