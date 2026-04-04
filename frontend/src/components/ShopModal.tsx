import { useState } from "react";
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, 
  useTheme, useMediaQuery, Divider, Chip, IconButton
} from "@mui/material";
import { Add, Remove, Close } from "@mui/icons-material";
import { useGame } from "../store/gameStore";
import { MATERIAL_MAP } from "../data/masters/materialMaster";
import type { TownMaster } from "../types/town";
import { getEquipmentById } from "../data/masters/equipmentMaster";

interface ShopModalProps {
  open: boolean;
  onClose: () => void;
  town: TownMaster;
}

interface ShopItemDisplay {
  id: string;
  name: string;
  type: "equipment" | "material";
  price: number;
  sprite: string;
  description?: string;
  quantity: number;
}

export default function ShopModal({ open, onClose, town }: ShopModalProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { state, dispatch } = useGame();
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  // ショップアイテムの表示情報を構築
  const shopItems: ShopItemDisplay[] = town.shopItems.map(shopItem => {
    if (shopItem.type === "equipment") {
      const equipment = getEquipmentById(shopItem.id);
      return {
        id: shopItem.id,
        name: equipment?.name || "不明な装備",
        type: "equipment",
        price: shopItem.price,
        sprite: equipment?.sprite || "❓",
        description: equipment?.effect,
        quantity: quantities[shopItem.id] || 0,
      };
    } else {
      const material = MATERIAL_MAP[shopItem.id];
      return {
        id: shopItem.id,
        name: material?.name || "不明な素材",
        type: "material",
        price: shopItem.price,
        sprite: material?.emoji || "❓",
        description: material?.description,
        quantity: quantities[shopItem.id] || 0,
      };
    }
  });

  const updateQuantity = (itemId: string, delta: number) => {
    setQuantities(prev => {
      const current = prev[itemId] || 0;
      const newQuantity = Math.max(0, current + delta);
      
      // 所持金チェック
      const item = shopItems.find(item => item.id === itemId);
      if (item && newQuantity > 0) {
        const totalCost = newQuantity * item.price;
        const otherItemsCost = Object.entries(prev)
          .filter(([id]) => id !== itemId)
          .reduce((sum, [id, qty]: [string, number]) => {
            const otherItem = shopItems.find(item => item.id === id);
            return sum + (otherItem ? qty * otherItem.price : 0);
          }, 0);
        
        if (totalCost + otherItemsCost > state.player.gold) {
          return prev; // 所持金不足
        }
      }
      
      return { ...prev, [itemId]: newQuantity };
    });
  };

  const getTotalCost = () => {
    return shopItems.reduce((total, item) => {
      return total + (quantities[item.id] || 0) * item.price;
    }, 0);
  };

  const getTotalQuantity = () => {
    return Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
  };

  const handlePurchase = () => {
    const totalCost = getTotalCost();
    if (totalCost > state.player.gold) {
      dispatch({ 
        type: "NOTIFY", 
        payload: { message: "所持金が不足しています", severity: "error" } 
      });
      return;
    }

    if (getTotalQuantity() === 0) {
      dispatch({ 
        type: "NOTIFY", 
        payload: { message: "購入するアイテムを選択してください", severity: "warning" } 
      });
      return;
    }

    // 購入処理
    Object.entries(quantities).forEach(([itemId, qty]) => {
      if (qty > 0) {
        const item = shopItems.find(shopItem => shopItem.id === itemId);
        if (item) {
          if (item.type === "equipment") {
            // 装備品を追加
            for (let i = 0; i < qty; i++) {
              const equipment = getEquipmentById(itemId);
              if (equipment) {
                const newEquipment = { 
                  ...equipment, 
                  id: `${equipment.id}-${Date.now()}-${i}`,
                  equippedTo: null 
                };
                dispatch({ type: "ADD_EQUIPMENT", payload: newEquipment });
              }
            }
          } else {
            // 素材を追加
            dispatch({ 
              type: "ADD_MATERIALS", 
              payload: { [itemId]: qty } 
            });
          }
        }
      }
    });

    // 所持金を減らす
    dispatch({ 
      type: "UPDATE_PLAYER", 
      payload: { gold: state.player.gold - totalCost } 
    });

    dispatch({ 
      type: "NOTIFY", 
      payload: { 
        message: `${getTotalQuantity()}個のアイテムを${totalCost}Gで購入しました`, 
        severity: "success" 
      } 
    });

    // 数量をリセット
    setQuantities({});
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          background: "linear-gradient(135deg, rgba(20,15,40,0.98) 0%, rgba(40,30,70,0.95) 100%)",
          border: "2px solid rgba(124,77,255,0.3)",
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)",
          color: "text.primary",
          maxHeight: "90vh",
        },
      }}
    >
      <DialogTitle sx={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        pb: 1,
      }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography sx={{ fontSize: "1.5rem" }}>🛍️</Typography>
          <Typography variant="h6" sx={{ color: "rgba(180,140,255,0.9)" }}>
            {town.emoji} {town.name} 店
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: "rgba(200,180,255,0.7)" }}>
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ py: 2 }}>
        {/* 所持金表示 */}
        <Box sx={{ mb: 2, p: 1.5, background: "rgba(124,77,255,0.08)", borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ color: "rgba(180,140,255,0.9)" }}>
            所持金: {state.player.gold}G
          </Typography>
        </Box>

        {/* アイテムリスト */}
        <Box sx={{ maxHeight: 400, overflowY: "auto" }}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
            {shopItems.map((item) => (
              <Box key={item.id}>
                <Box sx={{
                  p: 2,
                  border: "1px solid rgba(124,77,255,0.2)",
                  borderRadius: 2,
                  background: "rgba(124,77,255,0.04)",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    background: "rgba(124,77,255,0.08)",
                    borderColor: "rgba(124,77,255,0.4)",
                  },
                }}>
                  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, mb: 1 }}>
                    <Typography sx={{ fontSize: "1.5rem" }}>{item.sprite}</Typography>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "rgba(200,180,255,0.95)" }}>
                        {item.name}
                      </Typography>
                      <Chip 
                        label={item.type === "equipment" ? "装備品" : "素材"} 
                        size="small" 
                        sx={{ 
                          fontSize: "0.7rem", 
                          height: 20,
                          background: item.type === "equipment" 
                            ? "rgba(255,163,102,0.2)" 
                            : "rgba(124,77,255,0.2)",
                          color: item.type === "equipment" 
                            ? "rgba(255,163,102,0.9)" 
                            : "rgba(124,77,255,0.9)",
                        }} 
                      />
                      {item.description && (
                        <Typography variant="caption" sx={{ 
                          display: "block", 
                          mt: 0.5, 
                          color: "rgba(180,160,255,0.7)",
                          fontSize: "0.75rem",
                        }}>
                          {item.description}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Typography variant="subtitle2" sx={{ color: "gold", fontWeight: 600 }}>
                      {item.price}G
                    </Typography>
                    
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => updateQuantity(item.id, -1)}
                        disabled={item.quantity === 0}
                        sx={{ 
                          color: "rgba(200,180,255,0.7)",
                          "&:hover": { color: "rgba(200,180,255,0.9)" },
                          "&.Mui-disabled": { color: "rgba(200,180,255,0.3)" },
                        }}
                      >
                        <Remove fontSize="small" />
                      </IconButton>
                      
                      <Typography sx={{ 
                        minWidth: 30, 
                        textAlign: "center",
                        fontWeight: 600,
                        color: "rgba(200,180,255,0.9)",
                      }}>
                        {item.quantity}
                      </Typography>
                      
                      <IconButton
                        size="small"
                        onClick={() => updateQuantity(item.id, 1)}
                        sx={{ 
                          color: "rgba(200,180,255,0.7)",
                          "&:hover": { color: "rgba(200,180,255,0.9)" },
                        }}
                      >
                        <Add fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </DialogContent>
      
      <Divider sx={{ borderColor: "rgba(124,77,255,0.3)" }} />
      
      <DialogActions sx={{ 
        justifyContent: "space-between", 
        alignItems: "center",
        p: 2,
        gap: 2,
      }}>
        <Box>
          <Typography variant="subtitle2" sx={{ color: "rgba(180,140,255,0.9)" }}>
            合計: {getTotalQuantity()}個 / {getTotalCost()}G
          </Typography>
        </Box>
        
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            onClick={onClose}
            variant="outlined"
            size={isMobile ? "large" : "medium"}
            sx={{
              borderColor: "rgba(124,77,255,0.5)",
              color: "rgba(200,180,255,0.9)",
              "&:hover": {
                borderColor: "rgba(124,77,255,0.8)",
                backgroundColor: "rgba(124,77,255,0.1)",
              },
            }}
          >
            キャンセル
          </Button>
          
          <Button
            onClick={handlePurchase}
            variant="contained"
            size={isMobile ? "large" : "medium"}
            disabled={getTotalQuantity() === 0 || getTotalCost() > state.player.gold}
            sx={{
              background: "linear-gradient(135deg, rgba(124,77,255,0.8) 0%, rgba(80,50,180,0.7) 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, rgba(140,90,255,0.9) 0%, rgba(100,60,200,0.8) 100%)",
              },
              "&.Mui-disabled": {
                background: "rgba(100,100,100,0.3)",
                color: "rgba(200,200,200,0.5)",
              },
            }}
          >
            購入する
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
