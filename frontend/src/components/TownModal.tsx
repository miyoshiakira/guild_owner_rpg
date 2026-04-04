import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, useTheme, useMediaQuery, Divider } from "@mui/material";

interface TownModalProps {
  open: boolean;
  onClose: () => void;
  onShop: () => void;
  onInteract: () => void;
  town?: {
    name: string;
    description: string;
    emoji: string;
    npcs: Array<{
      name: string;
      dialogue: string;
      emoji?: string;
    }>;
  };
}

export default function TownModal({ open, onClose, onShop, onInteract, town }: TownModalProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (!town) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          background: "linear-gradient(135deg, rgba(20,15,40,0.98) 0%, rgba(40,30,70,0.95) 100%)",
          border: "2px solid rgba(124,77,255,0.3)",
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)",
          color: "text.primary",
        },
      }}
    >
      <DialogTitle sx={{ 
        textAlign: "center", 
        fontSize: { xs: "1.3rem", sm: "1.5rem" },
        fontWeight: 700,
        color: "rgba(180,140,255,0.9)",
        textShadow: "0 0 8px rgba(180,140,255,0.4)",
        pb: 1,
      }}>
        {town.emoji} {town.name}
      </DialogTitle>
      
      <DialogContent sx={{ py: 2 }}>
        <Typography 
          variant="body1" 
          sx={{ 
            textAlign: "center", 
            mb: 3,
            fontSize: { xs: "0.95rem", sm: "1rem" },
            color: "rgba(200,180,255,0.9)",
            lineHeight: 1.6,
          }}
        >
          {town.description}
        </Typography>

        {/* NPCリスト */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1.5, color: "rgba(180,140,255,0.9)", fontWeight: 600 }}>
            👥 町の人々
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {town.npcs.map((npc, index) => (
              <Box 
                key={index}
                sx={{
                  p: 1.5,
                  background: "rgba(124,77,255,0.08)",
                  border: "1px solid rgba(124,77,255,0.2)",
                  borderRadius: 2,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    background: "rgba(124,77,255,0.12)",
                    borderColor: "rgba(124,77,255,0.3)",
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                  <Typography sx={{ fontSize: "1.2rem" }}>{npc.emoji}</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "rgba(200,180,255,0.95)" }}>
                    {npc.name}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: "rgba(180,160,255,0.85)", fontSize: "0.85rem", lineHeight: 1.4 }}>
                  「{npc.dialogue}」
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Divider sx={{ my: 2, borderColor: "rgba(124,77,255,0.3)" }} />
        
        <Box sx={{ 
          display: "flex", 
          flexDirection: { xs: "column", sm: "row" }, 
          gap: 2,
          justifyContent: "center",
        }}>
          <Button
            variant="contained"
            onClick={onShop}
            size={isMobile ? "large" : "medium"}
            sx={{
              flex: { xs: 1, sm: "auto" },
              minWidth: { xs: "auto", sm: 140 },
              py: { xs: 1.5, sm: 1.2 },
              fontSize: { xs: "1rem", sm: "0.95rem" },
              fontWeight: 600,
              background: "linear-gradient(135deg, rgba(124,77,255,0.8) 0%, rgba(80,50,180,0.7) 100%)",
              border: "1px solid rgba(124,77,255,0.5)",
              boxShadow: "0 4px 12px rgba(124,77,255,0.3)",
              "&:hover": {
                background: "linear-gradient(135deg, rgba(140,90,255,0.9) 0%, rgba(100,60,200,0.8) 100%)",
                boxShadow: "0 6px 20px rgba(124,77,255,0.4)",
                transform: "translateY(-1px)",
              },
              transition: "all 0.2s ease",
            }}
          >
            🛍️ 買い物
          </Button>
          
          <Button
            variant="contained"
            onClick={onInteract}
            size={isMobile ? "large" : "medium"}
            sx={{
              flex: { xs: 1, sm: "auto" },
              minWidth: { xs: "auto", sm: 140 },
              py: { xs: 1.5, sm: 1.2 },
              fontSize: { xs: "1rem", sm: "0.95rem" },
              fontWeight: 600,
              background: "linear-gradient(135deg, rgba(255,163,102,0.8) 0%, rgba(230,120,60,0.7) 100%)",
              border: "1px solid rgba(255,163,102,0.5)",
              boxShadow: "0 4px 12px rgba(255,163,102,0.3)",
              "&:hover": {
                background: "linear-gradient(135deg, rgba(255,173,122,0.9) 0%, rgba(240,130,70,0.8) 100%)",
                boxShadow: "0 6px 20px rgba(255,163,102,0.4)",
                transform: "translateY(-1px)",
              },
              transition: "all 0.2s ease",
            }}
          >
            💬 交流
          </Button>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ 
        justifyContent: "center", 
        pt: 1,
        pb: { xs: 2, sm: 2.5 },
        px: { xs: 2, sm: 3 },
      }}>
        <Button
          onClick={onClose}
          variant="outlined"
          size={isMobile ? "large" : "medium"}
          sx={{
            minWidth: { xs: 100, sm: 120 },
            borderColor: "rgba(124,77,255,0.5)",
            color: "rgba(200,180,255,0.9)",
            "&:hover": {
              borderColor: "rgba(124,77,255,0.8)",
              backgroundColor: "rgba(124,77,255,0.1)",
            },
          }}
        >
          閉じる
        </Button>
      </DialogActions>
    </Dialog>
  );
}
