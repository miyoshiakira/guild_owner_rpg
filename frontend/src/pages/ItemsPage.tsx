import { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Tabs,
  Tab,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useGame } from "../store/gameStore";
import { MATERIAL_MAP } from "../data/masters/materialMaster";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`items-tabpanel-${index}`}
      aria-labelledby={`items-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

type DeleteTarget =
  | { kind: "item";      id: string; label: string; detail: string }
  | { kind: "material";  id: string; label: string; detail: string }
  | { kind: "equipment"; id: string; label: string; detail: string };

export default function ItemsPage() {
  const { state, dispatch } = useGame();
  const { items, materials } = state;
  const [tabValue, setTabValue] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  const filteredMaterials = Object.entries(materials)
    .filter(([_, count]) => count > 0)
    .map(([materialId, count]) => ({
      ...MATERIAL_MAP[materialId],
      count,
    }));

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    if (deleteTarget.kind === "item") {
      dispatch({ type: "REMOVE_ITEM", payload: { itemId: deleteTarget.id } });
    } else if (deleteTarget.kind === "material") {
      dispatch({ type: "REMOVE_MATERIAL", payload: { materialId: deleteTarget.id } });
    } else {
      dispatch({ type: "REMOVE_EQUIPMENT", payload: { equipmentId: deleteTarget.id } });
    }
    setDeleteTarget(null);
  };

  return (
    <Box sx={{ width: "100%", p: 2 }}>
      <Typography variant="h4" gutterBottom>
        アイテム管理
      </Typography>

      <Paper sx={{ width: "100%" }}>
        <Tabs
          value={tabValue}
          onChange={(_, v) => setTabValue(v)}
          aria-label="item categories"
          variant="fullWidth"
        >
          <Tab label="消耗品" />
          <Tab label="素材" />
          <Tab label="装備品" />
        </Tabs>

        {/* 消耗品タブ */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)", lg: "repeat(4, 1fr)" }, gap: 2 }}>
            {items.length === 0 ? (
              <Box sx={{ gridColumn: "1 / -1" }}>
                <Typography variant="body1" textAlign="center" color="text.secondary">
                  消耗品がありません
                </Typography>
              </Box>
            ) : (
              items.map((item) => (
                <Card key={item.id}>
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="h5">{item.sprite}</Typography>
                        <Typography variant="h6">{item.name}</Typography>
                      </Box>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteTarget({ kind: "item", id: item.id, label: item.name, detail: `所持数: ${item.quantity}個` })}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    <Chip label={`個数: ${item.quantity}`} color="primary" size="small" sx={{ mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">{item.effect}</Typography>
                  </CardContent>
                </Card>
              ))
            )}
          </Box>
        </TabPanel>

        {/* 素材タブ */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)", lg: "repeat(4, 1fr)" }, gap: 2 }}>
            {filteredMaterials.length === 0 ? (
              <Box sx={{ gridColumn: "1 / -1" }}>
                <Typography variant="body1" textAlign="center" color="text.secondary">
                  素材がありません
                </Typography>
              </Box>
            ) : (
              filteredMaterials.map((material) => (
                <Card key={material.id}>
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="h5">{material.emoji}</Typography>
                        <Typography variant="h6">{material.name}</Typography>
                      </Box>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteTarget({ kind: "material", id: material.id, label: material.name, detail: `所持数: ${material.count}個` })}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    <Chip label={`個数: ${material.count}`} color="secondary" size="small" sx={{ mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">{material.description}</Typography>
                  </CardContent>
                </Card>
              ))
            )}
          </Box>
        </TabPanel>

        {/* 装備品タブ */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)", lg: "repeat(4, 1fr)" }, gap: 2 }}>
            {state.equipment.length === 0 ? (
              <Box sx={{ gridColumn: "1 / -1" }}>
                <Typography variant="body1" textAlign="center" color="text.secondary">
                  装備品がありません
                </Typography>
              </Box>
            ) : (
              state.equipment.map((equipment) => {
                const slotLabel = equipment.slot === "weapon" ? "武器" : equipment.slot === "armor" ? "防具" : "アクセサリ";
                return (
                  <Card key={equipment.id}>
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="h5">{equipment.sprite}</Typography>
                          <Typography variant="h6">{equipment.name}</Typography>
                        </Box>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setDeleteTarget({ kind: "equipment", id: equipment.id, label: equipment.name, detail: equipment.equippedTo ? "装備中（外してから削除されます）" : `${slotLabel}・未装備` })}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      <Box sx={{ display: "flex", gap: 0.5, mb: 1, flexWrap: "wrap" }}>
                        <Chip label={slotLabel} color="info" size="small" />
                        {equipment.equippedTo ? (
                          <Chip label="装備中" color="success" size="small" />
                        ) : (
                          <Chip label="未装備" color="default" size="small" />
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary">{equipment.effect}</Typography>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </Box>
        </TabPanel>
      </Paper>

      {/* 削除確認モーダル */}
      <Dialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        PaperProps={{ sx: { borderRadius: 2, minWidth: 300, border: "1px solid rgba(244,67,54,0.4)" } }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          🗑️ 削除しますか？
        </DialogTitle>
        <DialogContent sx={{ pt: "0 !important" }}>
          <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
            {deleteTarget?.label}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {deleteTarget?.detail}
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            この操作は取り消せません。
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setDeleteTarget(null)} sx={{ color: "text.secondary" }}>
            キャンセル
          </Button>
          <Button variant="contained" color="error" onClick={handleDeleteConfirm}>
            削除する
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
