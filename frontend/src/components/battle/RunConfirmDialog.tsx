import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";

interface RunConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function RunConfirmDialog({ open, onClose, onConfirm }: RunConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: "background.paper",
          border: "1px solid rgba(255,152,0,0.3)",
          borderRadius: 2,
          backgroundImage: "none",
        },
      }}
    >
      <DialogTitle sx={{ borderBottom: "1px solid rgba(255,152,0,0.2)", fontWeight: 700 }}>
        💨 逃げる
      </DialogTitle>
      <DialogContent sx={{ pt: 2.5 }}>
        <Typography variant="body2" color="text.secondary">
          バトルから逃げますか？経験値・ゴールドは獲得できません。
        </Typography>
      </DialogContent>
      <DialogActions sx={{ borderTop: "1px solid rgba(255,255,255,0.08)", px: 3, py: 1.5, gap: 1 }}>
        <Button onClick={onClose} sx={{ color: "text.secondary" }}>
          戻る
        </Button>
        <Button variant="contained" color="warning" sx={{ fontWeight: 700 }} onClick={onConfirm}>
          逃げる
        </Button>
      </DialogActions>
    </Dialog>
  );
}
