import { useState, useEffect, useCallback, useRef } from "react";
import { Box, Typography } from "@mui/material";

const PAD_SIZE = 160;
const BTN_SIZE = 50;

const PAD_DIRS = [
  { dr: -1, dc:  0, key: "up",    label: "▲",
    pos: { top: 4, left: PAD_SIZE / 2 - BTN_SIZE / 2 } },
  { dr:  1, dc:  0, key: "down",  label: "▼",
    pos: { bottom: 4, left: PAD_SIZE / 2 - BTN_SIZE / 2 } },
  { dr:  0, dc: -1, key: "left",  label: "◀",
    pos: { left: 4, top: PAD_SIZE / 2 - BTN_SIZE / 2 } },
  { dr:  0, dc:  1, key: "right", label: "▶",
    pos: { right: 4, top: PAD_SIZE / 2 - BTN_SIZE / 2 } },
] as const;

interface CircularDPadProps {
  onMove: (dr: number, dc: number) => void;
}

export default function CircularDPad({ onMove }: CircularDPadProps) {
  const holdTimer    = useRef<ReturnType<typeof setTimeout>  | null>(null);
  const holdInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const startMove = useCallback((dr: number, dc: number, key: string) => {
    setActiveKey(key);
    onMove(dr, dc);
    holdTimer.current = setTimeout(() => {
      holdInterval.current = setInterval(() => onMove(dr, dc), 130);
    }, 220);
  }, [onMove]);

  const stopMove = useCallback(() => {
    setActiveKey(null);
    if (holdTimer.current)    { clearTimeout(holdTimer.current);   holdTimer.current    = null; }
    if (holdInterval.current) { clearInterval(holdInterval.current); holdInterval.current = null; }
  }, []);

  useEffect(() => () => stopMove(), [stopMove]);

  return (
    <Box sx={{ position: "relative", width: PAD_SIZE, height: PAD_SIZE, flexShrink: 0, userSelect: "none" }}>
      <Box sx={{
        position: "absolute", inset: 0,
        borderRadius: "50%",
        background: "radial-gradient(circle at 40% 35%, rgba(60,50,100,0.9) 0%, rgba(15,12,32,0.97) 100%)",
        border: "2px solid rgba(124,77,255,0.35)",
        boxShadow: "0 6px 24px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.07)",
      }} />
      <Box sx={{
        position: "absolute",
        top: "50%", left: BTN_SIZE + 8, right: BTN_SIZE + 8,
        height: 1, bgcolor: "rgba(124,77,255,0.18)", transform: "translateY(-50%)",
      }} />
      <Box sx={{
        position: "absolute",
        left: "50%", top: BTN_SIZE + 8, bottom: BTN_SIZE + 8,
        width: 1, bgcolor: "rgba(124,77,255,0.18)", transform: "translateX(-50%)",
      }} />
      <Box sx={{
        position: "absolute",
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: 28, height: 28,
        borderRadius: "50%",
        background: "radial-gradient(circle at 40% 35%, rgba(160,130,255,0.25), rgba(80,60,160,0.15))",
        border: "1.5px solid rgba(124,77,255,0.4)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)",
      }} />
      {PAD_DIRS.map(({ dr, dc, key, label, pos }) => {
        const active = activeKey === key;
        return (
          <Box
            key={key}
            sx={{
              position: "absolute",
              width: BTN_SIZE, height: BTN_SIZE,
              borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
              touchAction: "none",
              background: active
                ? "radial-gradient(circle, rgba(160,120,255,0.7), rgba(100,60,200,0.5))"
                : "radial-gradient(circle at 40% 35%, rgba(100,80,180,0.35), rgba(60,40,120,0.2))",
              border: `1.5px solid ${active ? "rgba(180,150,255,0.9)" : "rgba(124,77,255,0.5)"}`,
              boxShadow: active
                ? "0 0 16px rgba(124,77,255,0.7), inset 0 1px 0 rgba(255,255,255,0.2)"
                : "inset 0 1px 0 rgba(255,255,255,0.08)",
              transform: active ? "scale(0.86)" : "scale(1)",
              transition: "transform 0.07s, background 0.07s, box-shadow 0.07s, border-color 0.07s",
              ...pos,
            }}
            onPointerDown={(e) => { e.preventDefault(); startMove(dr, dc, key); }}
            onPointerUp={stopMove}
            onPointerLeave={stopMove}
            onPointerCancel={stopMove}
          >
            <Typography sx={{
              fontSize: 17, lineHeight: 1, fontWeight: 700,
              color: active ? "#fff" : "rgba(180,160,255,0.9)",
              textShadow: active ? "0 0 8px rgba(200,180,255,0.8)" : "none",
            }}>
              {label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}
