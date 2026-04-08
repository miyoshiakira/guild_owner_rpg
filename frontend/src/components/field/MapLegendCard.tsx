import { memo } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
} from "@mui/material";
import { MAP_TILE_NAMES, MAP_TILE_COLORS } from "../../data/masters/mapMaster";

const MapLegendCard = memo(function MapLegendCard() {
  return (
    <Card sx={{ minWidth: 160 }}>
      <CardContent sx={{ pb: "12px !important" }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>凡例</Typography>
        {Object.entries(MAP_TILE_NAMES).map(([k, v]) => (
          <Box key={k} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <Box sx={{
              width: 14, height: 14,
              bgcolor: MAP_TILE_COLORS[Number(k)],
              borderRadius: 0.5,
              flexShrink: 0,
              border: Number(k) === 9 ? "1px solid rgba(180,140,255,0.7)" : "none",
            }} />
            <Typography variant="caption">{v}</Typography>
          </Box>
        ))}
      </CardContent>
    </Card>
  );
});

export default MapLegendCard;
