import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Avatar,
} from "@mui/material";
import type { EventReward } from "../types/masters";
import { STORY_EVENT_MAP } from "../data/masters/storyEventMaster";
import { STORY_NPC_MAP } from "../data/masters/storyNPCMaster";
import { useGame } from "../store/gameStore";
import { getRewardMessage } from "../utils/notificationUtils";

interface EventModalProps {
  open: boolean;
  eventId: string;
  onClose: () => void;
  onBattleStart?: (enemyIds: string[]) => void;
}

export default function EventModal({
  open,
  eventId,
  onClose,
  onBattleStart,
}: EventModalProps) {
  const { state, dispatch } = useGame();
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);

  const event = STORY_EVENT_MAP[eventId];
  if (!event) return null;

  const eventData = event.data;
  const isConversation = eventData.type === "conversation";
  const isBattle = eventData.type === "battle";

  const handleChoice = (choiceIndex: number) => {
    setSelectedChoice(choiceIndex);
    if (!isConversation) return;
    const choice = eventData.choices?.[choiceIndex];
    if (!choice) return;

    // 報酬を付与
    if (choice.rewards) {
      applyRewards(choice.rewards);
    }

    // 次のイベントへ
    if (choice.nextEventId) {
      // 親コンポーネントに次のイベントIDを通知（必要に応じて実装）
      onClose();
      // TODO: 次のイベントを開始するロジック
    } else {
      onClose();
    }
  };

  const applyRewards = (rewards: EventReward[]) => {
    rewards.forEach((reward) => {
      switch (reward.type) {
        case "gold":
          dispatch({
            type: "UPDATE_PLAYER",
            payload: { gold: state.player.gold + (reward.gold ?? 0) },
          });
          dispatch({
            type: "NOTIFY",
            payload: { message: getRewardMessage(reward), severity: "success" },
          });
          break;
        case "exp":
          dispatch({
            type: "UPDATE_PLAYER",
            payload: { exp: state.player.exp + (reward.exp ?? 0) },
          });
          dispatch({
            type: "NOTIFY",
            payload: { message: getRewardMessage(reward), severity: "success" },
          });
          break;
        case "flag":
          dispatch({
            type: "SET_STORY_FLAG",
            payload: { flag: reward.flag!, value: true },
          });
          dispatch({
            type: "NOTIFY",
            payload: { message: getRewardMessage(reward), severity: "info" },
          });
          break;
        case "equipment":
          // TODO: 装備品を追加するロジック
          dispatch({
            type: "NOTIFY",
            payload: { message: getRewardMessage(reward), severity: "success" },
          });
          break;
        case "item":
          // TODO: アイテムを追加するロジック
          dispatch({
            type: "NOTIFY",
            payload: { message: getRewardMessage(reward), severity: "success" },
          });
          break;
      }
    });
    // イベントを完了としてマーク
    dispatch({
      type: "COMPLETE_EVENT",
      payload: eventId,
    });
  };

  const npc = isConversation ? STORY_NPC_MAP[eventData.npcId] : null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { borderRadius: 2, minWidth: 400, maxWidth: 600 } }}
      fullWidth
    >
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
        {event.name}
        <Chip
          label={`第${event.chapter + 1}章`}
          size="small"
          sx={{ ml: 2 }}
          color="primary"
        />
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {event.description}
          </Typography>

          {isConversation && npc && (
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 2 }}>
              <Avatar sx={{ width: 48, height: 48, fontSize: 24 }}>
                {npc.emoji}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                  {npc.name}
                </Typography>
                <Typography variant="body1" sx={{ bgcolor: "rgba(0,0,0,0.05)", p: 1.5, borderRadius: 1 }}>
                  {eventData.dialogue}
                </Typography>
              </Box>
            </Box>
          )}

          {isBattle && (
            <Box sx={{ textAlign: "center", py: 2 }}>
              <Typography variant="h6" color="error" sx={{ mb: 1 }}>
                ⚔️ 戦闘開始！
              </Typography>
              <Typography variant="body2" color="text.secondary">
                敵が出現しました！
              </Typography>
            </Box>
          )}
        </Box>

        {isConversation && eventData.choices && eventData.choices.length > 0 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {eventData.choices.map((choice, index) => (
              <Button
                key={index}
                variant={selectedChoice === index ? "contained" : "outlined"}
                onClick={() => handleChoice(index)}
                sx={{ justifyContent: "flex-start", textAlign: "left" }}
                fullWidth
              >
                {choice.text}
              </Button>
            ))}
          </Box>
        )}

        {isBattle && (
          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                if (onBattleStart) {
                  onBattleStart(eventData.enemyIds);
                }
              }}
              fullWidth
            >
              戦う
            </Button>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        {isConversation && (!eventData.choices || eventData.choices.length === 0) && (
          <Button onClick={onClose}>閉じる</Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
