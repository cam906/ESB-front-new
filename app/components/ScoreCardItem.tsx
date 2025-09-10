"use client";
import React from "react";
import TeamImage from "./TeamImage";

type Competitor = { id: number; name: string; logo?: string | null };

export type PickItem = {
  id: number;
  title: string;
  status: number; // 0=new
  matchTime: string | Date;
  summary: string;
  cntUnlocked?: number;
  HomeCompetitor?: Competitor;
  AwayCompetitor?: Competitor;
};

type Props = {
  pick: PickItem;
  isUnlocked: boolean;
  isAdmin: boolean;
  hideButtons?: boolean;
  onShowUnlocked?: (pickId: number) => void;
  onUnlock?: (pickId: number) => void;
};

function statusName(status: number) {
  if (status === 1) return "NEW";
  if (status === 10) return "WON";
  if (status === 20) return "LOST";
  if (status === 30) return "PUSH";
  if (status === 100) return "CANCELLED";
  return "UNKNOWN";
}

function statusColor(status: number) {
  if (status === 1) return "text-gray-400";
  if (status === 10) return "text-success";
  if (status === 20) return "text-error";
  if (status === 30) return "text-yellow-500";
  if (status === 100) return "text-gray-400";
  return "text-gray-400";
}

export default function ScoreCardItem({ pick, isUnlocked, isAdmin, hideButtons, onShowUnlocked, onUnlock }: Props) {
  const unlocked = isUnlocked;
  const isNew = pick.status === 1;
  const dt = new Date(pick.matchTime);
  const timeStr = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(dt);

  return (
    <div className="card p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">{pick.title}</h3>
        <span className="text-sm text-gray-400">{timeStr}</span>
      </div>

      <div className="grid grid-cols-3 items-center gap-2">
        <div className="justify-self-start">
          <TeamImage name={pick.HomeCompetitor?.name || "Home"} logo={pick.HomeCompetitor?.logo} />
        </div>
        <div className="text-center text-sm">
          {isNew ? (
            isAdmin ? (
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs">Unlocked Count:</span>
                <span className="font-medium">{pick.cntUnlocked ?? 0}</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs">{unlocked ? "Unlocked" : "Locked"}</span>
                <span>{unlocked ? "🔓" : "🔒"}</span>
              </div>
            )
          ) : (
            <div className={`font-semibold ${statusColor(pick.status)}`}>{statusName(pick.status)}</div>
          )}
          <div className="mt-2 text-sm">
            {(unlocked || !isNew) ? pick.summary : <span className="text-gray-400">Unlock to view summary</span>}
          </div>
        </div>
        <div className="justify-self-end">
          <TeamImage name={pick.AwayCompetitor?.name || "Away"} logo={pick.AwayCompetitor?.logo} />
        </div>
      </div>

      {!hideButtons && (
        <div className="mt-2">
          {unlocked ? (
            <button className="btn-primary" onClick={() => onShowUnlocked?.(pick.id)}>{isAdmin ? "View pick" : "Show unlocked pick"}</button>
          ) : (
            <button className="btn-secondary" onClick={() => onUnlock?.(pick.id)}>Unlock pick</button>
          )}
        </div>
      )}
    </div>
  );
}


