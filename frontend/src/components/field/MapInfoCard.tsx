import { memo } from "react";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
} from "@mui/material";
import type { MapMasterData } from "../../data/masters/mapMaster";

export interface MapInfoCardProps {
  currentMap: MapMasterData;
}

const MapInfoCard = memo(function MapInfoCard({ currentMap }: MapInfoCardProps) {
  return (
    <Card sx={{ minWidth: 160 }}>
      <CardContent sx={{ pb: "12px !important" }}>
        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>現在地</Typography>
        <Typography variant="h6" sx={{ fontSize: 15 }}>
          {currentMap.emoji} {currentMap.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {currentMap.description}
        </Typography>
        {currentMap.transitions.length > 0 && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
              🚪 出口:
            </Typography>
            {currentMap.transitions.map((t, i) => (
              <Chip
                key={i}
                label={t.label}
                size="small"
                variant="outlined"
                sx={{ mr: 0.5, mb: 0.5, borderColor: "rgba(124,77,255,0.5)", fontSize: 10 }}
              />
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
});

export default MapInfoCard;
