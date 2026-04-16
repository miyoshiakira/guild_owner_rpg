import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Button } from "@mui/material";
import MapIcon from "@mui/icons-material/Map";
import StorageIcon from "@mui/icons-material/Storage";
import PublicIcon from "@mui/icons-material/Public";
import { STORY_EVENT_MASTER } from "../data/masters/storyEventMaster";
import { MAP_MASTER_MAP } from "../data/masters/mapMaster";
import { MAP_TILE_MASTER } from "../data/map/mapChipConfig";
import { useGame } from "../store/gameStore";

export default function DebugPage() {
  const { dispatch } = useGame();

  const conflicts: Array<{
    event: typeof STORY_EVENT_MASTER[0];
    mapName: string;
    tileType: number;
    tileName: string;
    walkable: boolean;
  }> = [];

  STORY_EVENT_MASTER.forEach((event) => {
    const map = MAP_MASTER_MAP[event.mapId];
    if (!map) return;

    const tile = map.tileMap[event.position.row]?.[event.position.col];
    if (tile === undefined) return;

    const tileConfig = MAP_TILE_MASTER[tile];
    if (!tileConfig || !tileConfig.walkable) {
      conflicts.push({
        event,
        mapName: map.name,
        tileType: tile,
        tileName: tileConfig?.name ?? "Unknown",
        walkable: tileConfig?.walkable ?? false,
      });
    }
  });

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Typography variant="h4">
          イベント位置デバッグ
        </Typography>
        <Button
          variant="outlined"
          startIcon={<MapIcon />}
          onClick={() => dispatch({ type: "SET_SCENE", payload: "mapeditor" })}
        >
          マップエディタ
        </Button>
        <Button
          variant="outlined"
          startIcon={<StorageIcon />}
          onClick={() => dispatch({ type: "SET_SCENE", payload: "masterEditor" })}
        >
          マスタ編集
        </Button>
        <Button
          variant="outlined"
          startIcon={<PublicIcon />}
          onClick={() => dispatch({ type: "SET_SCENE", payload: "worldEditor" })}
        >
          地図編集
        </Button>
      </Box>

      <Typography variant="h6" sx={{ mb: 2 }}>
        進行不可能タイル上のイベント: {conflicts.length}件
      </Typography>

      {conflicts.length === 0 ? (
        <Typography color="success.main">問題なし</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>イベントID</TableCell>
                <TableCell>イベント名</TableCell>
                <TableCell>マップ</TableCell>
                <TableCell>座標</TableCell>
                <TableCell>タイル種類</TableCell>
                <TableCell>進行可能</TableCell>
                <TableCell>トリガー</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {conflicts.map((conflict, index) => (
                <TableRow key={index}>
                  <TableCell>{conflict.event.id}</TableCell>
                  <TableCell>{conflict.event.name}</TableCell>
                  <TableCell>{conflict.mapName}</TableCell>
                  <TableCell>({conflict.event.position.row}, {conflict.event.position.col})</TableCell>
                  <TableCell>
                    {conflict.tileName} ({conflict.tileType})
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={conflict.walkable ? "可能" : "不可能"}
                      color={conflict.walkable ? "success" : "error"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{conflict.event.trigger}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
        全イベント一覧 ({STORY_EVENT_MASTER.length}件)
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>イベントID</TableCell>
              <TableCell>イベント名</TableCell>
              <TableCell>マップ</TableCell>
              <TableCell>座標</TableCell>
              <TableCell>トリガー</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {STORY_EVENT_MASTER.map((event) => {
              const map = MAP_MASTER_MAP[event.mapId];

              return (
                <TableRow key={event.id}>
                  <TableCell>{event.id}</TableCell>
                  <TableCell>{event.name}</TableCell>
                  <TableCell>{map?.name ?? "Unknown"}</TableCell>
                  <TableCell>({event.position.row}, {event.position.col})</TableCell>
                  <TableCell>{event.trigger}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
