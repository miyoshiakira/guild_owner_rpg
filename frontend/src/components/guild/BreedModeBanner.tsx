import { memo } from "react";
import { Box, Typography } from "@mui/material";
import type { Monster } from "../../types/game";

export interface BreedModeBannerProps {
  breedStep: "off" | "base" | "partner";
  breedBase: Monster | null;
}

const BreedModeBanner = memo(function BreedModeBanner({
  breedStep,
  breedBase,
}: BreedModeBannerProps) {
  if (breedStep === "off") return null;

  return (
    <Box sx={{
      mb: 1.5, px: 1.5, py: 1,
      bgcolor: "rgba(255,193,7,0.08)",
      border: "1px solid rgba(255,193,7,0.4)",
      borderRadius: 1.5,
    }}>
      <Typography variant="body2" color="warning.main" fontWeight={600} sx={{ fontSize: 12 }}>
        {breedStep === "base"
          ? "⚗ ベースにするモンスターを選んでください（Lv10以上）"
          : `⚗ 「${breedBase?.name}」と配合するモンスターを選んでください（Lv10以上・別モンスター）`}
      </Typography>
    </Box>
  );
});

export default BreedModeBanner;
