"use client";
import React from "react";

type Props = {
  open: boolean;
  credits: number;
  onClose: () => void;
  onConfirm: () => void;
};

export default function UnlockPickModal({ open, credits, onClose, onConfirm }: Props) {
  if (!open) return null;
  const hasCredits = credits > 0;
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
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          {hasCredits ? (
            <button className="btn-primary" onClick={onConfirm}>Confirm</button>
          ) : (
            <a className="btn-primary" href="/packages">Buy Credits</a>
          )}
        </div>
      </div>
    </div>
  );
}


