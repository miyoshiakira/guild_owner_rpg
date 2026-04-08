import { memo } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
} from "@mui/material";

export interface CraftSearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  resultCount: number;
}

const CraftSearchBar = memo(function CraftSearchBar({
  searchQuery,
  onSearchChange,
  resultCount,
}: CraftSearchBarProps) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2, flexWrap: "wrap" }}>
      <Typography variant="h4" sx={{ flexShrink: 0 }}>
        クラフト
      </Typography>
      <TextField
        size="small"
        placeholder="レシピ・素材名で検索…"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
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
                onClick={() => onSearchChange("")}
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
          {resultCount} 件
        </Typography>
      )}
    </Box>
  );
});

export default CraftSearchBar;
