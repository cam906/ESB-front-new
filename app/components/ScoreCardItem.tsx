"use client";
import React from "react";
import TeamImage from "./TeamImage";

type Competitor = { id: number; name: string; logo?: string | null };

export type PickItem = {
  id: number;
  title: string;
  status: number; // 0=new
  matchTime: string | Date;
  summary?: string | null;
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
      id={`pick-card-${pick.id}`}
      className={`card p-4 flex flex-col gap-3 ${clickable ? 'cursor-pointer transition-transform hover:-translate-y-0.5 hover:shadow-md' : ''}`}
      onClick={handleOpen}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      <div className="text-center">
        <h3 className="font-semibold text-xl px-2">{pick.title}</h3>
        <div className="text-sm text-gray-400 mt-0.5">{timeStr}</div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 items-center gap-2">
        <div className="justify-self-center order-1 md:order-1">
          <TeamImage name={pick.HomeCompetitor?.name || "Home"} logo={pick.HomeCompetitor?.logo} />
        </div>
        <div className="text-center text-sm col-span-2 md:col-span-1 order-3 md:order-2">
          {isNew && !unlocked ? (
            <div className="relative rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/10 p-4 overflow-hidden">
              <div className="text-left text-xs text-slate-500 dark:text-slate-400 leading-5 blur-[2px] select-none">
                {`Key injuries could alter rotations, but coaching adjustments and bench depth are expected to stabilize performance.`}
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  className="px-8 py-3 rounded-full bg-gradient-to-r from-yellow-400 via-amber-400 to-lime-300 text-black text-lg font-extrabold uppercase tracking-wide shadow-lg hover:shadow-2xl hover:scale-[1.04] transition cursor-pointer ring-2 ring-yellow-300"
                  aria-label="Unlock winner"
                  onClick={(e) => { e.stopPropagation(); onUnlock?.(pick.id); }}
                >
                  Unlock Winner 🏆
                </button>
              </div>
            </div>
          ) : (
            <>
              {isNew ? (
                isAdmin ? (
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xs">Unlocked Count:</span>
                    <span className="font-medium">{pick.cntUnlocked ?? 0}</span>
                  </div>
                ) : null
              ) : (
                <div className={`font-semibold ${statusColor(pick.status)}`}>{statusName(pick.status)}</div>
              )}
              <div className="mt-2">
                {(unlocked || !isNew) ? (
                  <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/10 p-4 text-center text-sm">
                    {pick.summary ?? ""}
                  </div>
                ) : null}
              </div>
            </>
          )}
        </div>
        <div className="justify-self-center order-2 md:order-3">
          <TeamImage name={pick.AwayCompetitor?.name || "Away"} logo={pick.AwayCompetitor?.logo} />
        </div>
      </div>

      {/* Buttons removed; whole card is clickable */}
    </div>
  );
}

