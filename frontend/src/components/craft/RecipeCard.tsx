import { memo } from "react";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Box,
} from "@mui/material";
import { MATERIAL_MAP } from "../../data/masters/materialMaster";
import type { CraftRecipe } from "../../types/masters";

export interface RecipeCardProps {
  recipe: CraftRecipe;
  craftable: boolean;
  materials: Record<string, number>;
  onClick: () => void;
}

const RecipeCard = memo(function RecipeCard({
  recipe,
  craftable,
  materials,
  onClick,
}: RecipeCardProps) {
  const getIngredientStatus = (materialId: string, requiredQty: number) => {
    const currentQty = materials[materialId] || 0;
    return {
      hasEnough: currentQty >= requiredQty,
      current: currentQty,
      required: requiredQty,
    };
  };

  return (
    <Card
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
          onClick={onClick}
        >
          {craftable ? "作成する" : "素材不足"}
        </Button>
      </CardContent>
    </Card>
  );
});

export default RecipeCard;
