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
} from "@mui/material";
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

export default function ItemsPage() {
  const { state } = useGame();
  const { items, materials } = state;
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // 素材アイテムを個数が0より大きいものだけにフィルタリング
  const filteredMaterials = Object.entries(materials)
    .filter(([_, count]) => count > 0)
    .map(([materialId, count]) => ({
      ...MATERIAL_MAP[materialId],
      count,
    }));

  return (
    <Box sx={{ width: "100%", p: 2 }}>
      <Typography variant="h4" gutterBottom>
        アイテム管理
      </Typography>

      <Paper sx={{ width: "100%" }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="item categories"
          variant="fullWidth"
        >
          <Tab label="消耗品" />
          <Tab label="素材" />
          <Tab label="装備品" />
        </Tabs>

        {/* 消耗品タブ */}
        <TabPanel value={tabValue} index={0}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
                lg: "repeat(4, 1fr)",
              },
              gap: 2,
            }}
          >
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
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Typography variant="h5">{item.sprite}</Typography>
                      <Typography variant="h6">{item.name}</Typography>
                    </Box>
                    <Chip
                      label={`個数: ${item.quantity}`}
                      color="primary"
                      size="small"
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {item.effect}
                    </Typography>
                  </CardContent>
                </Card>
              ))
            )}
          </Box>
        </TabPanel>

        {/* 素材タブ */}
        <TabPanel value={tabValue} index={1}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
                lg: "repeat(4, 1fr)",
              },
              gap: 2,
            }}
          >
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
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Typography variant="h5">{material.emoji}</Typography>
                      <Typography variant="h6">{material.name}</Typography>
                    </Box>
                    <Chip
                      label={`個数: ${material.count}`}
                      color="secondary"
                      size="small"
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {material.description}
                    </Typography>
                  </CardContent>
                </Card>
              ))
            )}
          </Box>
        </TabPanel>

        {/* 装備品タブ */}
        <TabPanel value={tabValue} index={2}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
                lg: "repeat(4, 1fr)",
              },
              gap: 2,
            }}
          >
            {state.equipment.length === 0 ? (
              <Box sx={{ gridColumn: "1 / -1" }}>
                <Typography variant="body1" textAlign="center" color="text.secondary">
                  装備品がありません
                </Typography>
              </Box>
            ) : (
              state.equipment.map((equipment) => (
                <Card key={equipment.id}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Typography variant="h5">{equipment.sprite}</Typography>
                      <Typography variant="h6">{equipment.name}</Typography>
                    </Box>
                    <Chip
                      label={`${equipment.slot === "weapon" ? "武器" : 
                              equipment.slot === "armor" ? "防具" : "アクセサリ"}`}
                      color="info"
                      size="small"
                      sx={{ mb: 1 }}
                    />
                    {equipment.equippedTo ? (
                      <Chip
                        label="装備中"
                        color="success"
                        size="small"
                        sx={{ mb: 1 }}
                      />
                    ) : (
                      <Chip
                        label="未装備"
                        color="default"
                        size="small"
                        sx={{ mb: 1 }}
                      />
                    )}
                    <Typography variant="body2" color="text.secondary">
                      {equipment.effect}
                    </Typography>
                  </CardContent>
                </Card>
              ))
            )}
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  );
}
