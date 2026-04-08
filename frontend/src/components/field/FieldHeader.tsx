import { memo } from "react";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Box,
} from "@mui/material";
import type { MapMasterData } from "../../data/masters/mapMaster";
import { MAP_TILE_NAMES } from "../../data/masters/mapMaster";

export interface FieldHeaderProps {
  currentMap: MapMasterData;
  currentTile: number;
  stepCount: number;
  onWorldMapClick: () => void;
}

const FieldHeader = memo(function FieldHeader({
  currentMap,
  currentTile,
  stepCount,
  onWorldMapClick,
}: FieldHeaderProps) {
  return (
    <Card sx={{ mb: 1.5 }}>
      <CardContent sx={{ py: "8px !important", px: "12px !important" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          <Chip
            label={`${currentMap.emoji} ${currentMap.name}`}
            size="small"
            sx={{ bgcolor: "rgba(124,77,255,0.18)", borderColor: "rgba(124,77,255,0.5)", color: "text.primary" }}
            variant="outlined"
          />
          <Chip label={MAP_TILE_NAMES[currentTile]} size="small" variant="outlined" />
          <Chip label={`歩数: ${stepCount}`} size="small" variant="outlined" />
          <Button
            size="small"
            variant="outlined"
            sx={{ ml: "auto", borderColor: "rgba(124,77,255,0.5)", color: "text.secondary" }}
            onClick={onWorldMapClick}
          >
            🗺️
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
});

export default FieldHeader;
