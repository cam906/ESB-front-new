"use client";
import React, { useState } from "react";
import { gql } from "@apollo/client";
import { useApolloClient } from "@apollo/client/react";

type Props = {
  open: boolean;
  credits: number;
  userId?: number;
  pickId?: number;
  onClose: () => void;
  onUnlocked?: (pickId: number) => void;
};

const UNLOCK_PICK = gql`mutation Unlock($userId: ID!, $pickId: ID!) { unlockPick(userId: $userId, pickId: $pickId) { id } }`;

export default function UnlockPickModal({ open, credits, userId, pickId, onClose, onUnlocked }: Props) {
  const client = useApolloClient();
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;
  const hasCredits = credits > 0;

  async function handleConfirm() {
    if (!userId || !pickId) return;
    try {
      setSubmitting(true);
      await client.mutate({ mutation: UNLOCK_PICK, variables: { userId: String(userId), pickId: String(pickId) } });
      onUnlocked?.(pickId);
      onClose();
    } catch (e) {
      console.error("Failed to unlock pick", e);
      // naive alert substitute; replace with toast if available
      alert("Failed to unlock pick. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative card w-full max-w-md overflow-hidden">
        <div className="absolute -inset-x-10 -top-10 h-32 bg-gradient-to-r from-sky-300/40 via-blue-300/30 to-cyan-300/40 blur-2xl pointer-events-none" />
        <div className="relative p-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-2xl font-bold">Unlock Pick</h3>
              <p className="text-sm text-gray-600 dark:text-sky-300 dark:bg-sky-900/30 dark:px-2 dark:py-0.5 dark:rounded-md">Instant access to full analysis</p>
            </div>
            <button className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-slate-800 text-white shadow-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-300/60" aria-label="Close" onClick={onClose} disabled={submitting}>×</button>
          </div>

          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-4 mb-4">
            {hasCredits ? (
              <p>Spend <span className="font-semibold">1 credit</span> to unlock this pick?</p>
            ) : (
              <p>You have 0 credits. Purchase a package to continue.</p>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <button className="btn-secondary" onClick={onClose} disabled={submitting}>Cancel</button>
            {hasCredits ? (
              <button className="px-6 py-2 rounded-full bg-gradient-to-r from-sky-400 via-blue-400 to-cyan-300 text-white font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] transition cursor-pointer ring-1 ring-sky-300" onClick={handleConfirm} disabled={submitting || !userId || !pickId}>
                {submitting ? "Unlocking…" : "Unlock Now"}
              </button>
            ) : (
              <a className="px-6 py-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] transition cursor-pointer" href="/packages">Buy Credits</a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


