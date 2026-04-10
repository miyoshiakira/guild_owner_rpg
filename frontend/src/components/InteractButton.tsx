import { Button, useTheme, useMediaQuery } from "@mui/material";

interface InteractButtonProps {
  onInteract: () => void;
}

export default function InteractButton({ onInteract }: InteractButtonProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Button
      variant="contained"
      onClick={onInteract}
      size={isMobile ? "large" : "medium"}
      sx={{
        position: "fixed",
        bottom: { xs: 150, sm: 190 },
        right: { xs: 16, sm: 24 },
        zIndex: 9999,
        minWidth: { xs: 120, sm: 140 },
        py: { xs: 1.5, sm: 1.2 },
        fontSize: { xs: "0.9rem", sm: "0.95rem" },
        fontWeight: 600,
        background: "#ffc107",
        border: "3px solid #ff9800",
        boxShadow: "0 4px 16px rgba(255,193,7,0.6)",
        color: "#000",
        borderRadius: 3,
        transition: "all 0.3s ease",
        "&:hover": {
          background: "#ffb300",
          boxShadow: "0 6px 24px rgba(255,193,7,0.8)",
          transform: "translateY(-2px) scale(1.05)",
        },
        "&:active": {
          transform: "translateY(0) scale(0.98)",
        },
      }}
    >
      💬 話す
    </Button>
  );
}
