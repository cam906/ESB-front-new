"use client";
import React, { useMemo, useState } from "react";
import { ApolloClient, HttpLink, InMemoryCache, gql } from "@apollo/client";

type Props = {
  open: boolean;
  credits: number;
  userId?: number;
  pickId?: number;
  onClose: () => void;
  onUnlocked?: (pickId: number) => void;
};

const UNLOCK_PICK = gql`mutation Unlock($userId: ID!, $pickId: ID!) { unlockPick(userId: $userId, pickId: $pickId) { id } }`;

function createClient() {
  return new ApolloClient({
    link: new HttpLink({ uri: "/api/graphql", credentials: "same-origin" }),
    cache: new InMemoryCache(),
  });
}

export default function UnlockPickModal({ open, credits, userId, pickId, onClose, onUnlocked }: Props) {
  const client = useMemo(() => createClient(), []);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="card p-6 w-full max-w-sm">
        <h3 className="text-xl font-semibold mb-2">Unlock Pick</h3>
        {hasCredits ? (
          <p className="mb-4">Spend 1 credit to unlock this pick?</p>
        ) : (
          <p className="mb-4">You have 0 credits. Please purchase a package to continue.</p>
        )}
        <div className="flex gap-2 justify-end">
          <button className="btn-secondary" onClick={onClose} disabled={submitting}>Cancel</button>
          {hasCredits ? (
            <button className="btn-primary" onClick={handleConfirm} disabled={submitting || !userId || !pickId}>
              {submitting ? "Unlocking…" : "Confirm"}
            </button>
          ) : (
            <a className="btn-primary" href="/packages">Buy Credits</a>
          )}
        </div>
      </div>
    </div>
  );
}


