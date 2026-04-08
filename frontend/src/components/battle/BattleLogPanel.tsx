import { Card, CardContent, Typography } from "@mui/material";
import type { LogLine } from "./battleTypes";

interface BattleLogPanelProps {
  log: LogLine[];
}

export function BattleLogPanel({ log }: BattleLogPanelProps) {
  return (
    <Card sx={{
      bgcolor: "rgba(8,8,20,0.92)",
      border: "1px solid rgba(255,255,255,0.1)",
      flex: 1,
      minHeight: 0,
      overflow: "hidden",
    }}>
      <CardContent sx={{ p: "8px 10px !important", height: "100%", overflow: "hidden" }}>
        {log.map((line, i) => (
          <Typography
            key={i}
            variant="caption"
            display="block"
            sx={{
              opacity: 1,
              lineHeight: 1.6,
              animation: i === 0 ? "log-slide-in 0.2s ease-out" : "none",
              fontSize: i === 0 ? "11.5px" : "11px",
            }}
          >
            {line.map((seg, j) => (
              <span key={j} style={{ color: seg.color ?? "#e0e0e0", fontWeight: seg.bold ? 700 : 400 }}>
                {seg.text}
              </span>
            ))}
          </Typography>
        ))}
      </CardContent>
    </Card>
  );
}
