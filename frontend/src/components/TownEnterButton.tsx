import { Button, useTheme, useMediaQuery } from "@mui/material";

interface TownEnterButtonProps {
  onEnterTown: () => void;
}

export default function TownEnterButton({ onEnterTown }: TownEnterButtonProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Button
      variant="contained"
      onClick={onEnterTown}
      size={isMobile ? "large" : "medium"}
      sx={{
        position: "fixed",
        bottom: { xs: 80, sm: 120 },
        right: { xs: 16, sm: 24 },
        zIndex: 1000,
        minWidth: { xs: 120, sm: 140 },
        py: { xs: 1.5, sm: 1.2 },
        fontSize: { xs: "0.9rem", sm: "0.95rem" },
        fontWeight: 600,
        background: "linear-gradient(135deg, rgba(124,77,255,0.9) 0%, rgba(80,50,180,0.8) 100%)",
        border: "2px solid rgba(124,77,255,0.6)",
        boxShadow: "0 4px 16px rgba(124,77,255,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
        color: "#ffffff",
        borderRadius: 3,
        transition: "all 0.3s ease",
        animation: "none",
        "&:hover": {
          background: "linear-gradient(135deg, rgba(140,90,255,1) 0%, rgba(100,60,200,0.9) 100%)",
          boxShadow: "0 6px 24px rgba(124,77,255,0.6), inset 0 1px 0 rgba(255,255,255,0.25)",
          transform: "translateY(-2px) scale(1.05)",
        },
        "&:active": {
          transform: "translateY(0) scale(0.98)",
        },
      }}
    >
      🏘 町に入る
    </Button>
  );
}
