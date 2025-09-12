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

export default function ScoreCardItem({ pick, isUnlocked, isAdmin, onShowUnlocked, onUnlock }: Props) {
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

  const clickable = typeof onShowUnlocked === 'function' || typeof onUnlock === 'function';

  function handleOpen() {
    if (!clickable) return;
    if (unlocked || !isNew) {
      onShowUnlocked?.(pick.id);
    } else {
      onUnlock?.(pick.id);
    }
  }

  return (
    <div
      className={`card p-4 flex flex-col gap-3 ${clickable ? 'cursor-pointer transition-transform hover:-translate-y-0.5 hover:shadow-md' : ''}`}
      onClick={handleOpen}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      <div className="grid grid-cols-[auto_1fr_auto] items-center">
        <div className="invisible text-sm text-gray-400 whitespace-nowrap" aria-hidden="true">{timeStr}</div>
        <h3 className="text-center font-semibold text-xl px-2">{pick.title}</h3>
        <div className="justify-self-end text-sm text-gray-400 whitespace-nowrap">{timeStr}</div>
      </div>

      <div className="grid grid-cols-3 items-center gap-2">
        <div className="justify-self-center">
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
        <div className="justify-self-center">
          <TeamImage name={pick.AwayCompetitor?.name || "Away"} logo={pick.AwayCompetitor?.logo} />
        </div>
      </div>

      {/* Buttons removed; whole card is clickable */}
    </div>
  );
}


