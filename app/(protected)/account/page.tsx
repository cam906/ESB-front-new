"use client";
import { useState } from "react";
import { useMe } from "@/app/lib/useMe";
import Link from "next/link";

export default function AccountPage() {
  const { user } = useMe();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mateEmail, setMateEmail] = useState("");

  const hasReferral = !!user?.myReferralCode;
  const referralCode = user?.myReferralCode ?? undefined;
  const credits = user?.credits;

  return (
    <div className="container mx-auto gutters section-spacing">
      <div className="flex flex-col md:flex-row gap-6">
        <aside className="hidden md:block md:w-64">
          <div className='Bet365Component iframe-container card p-0 overflow-hidden'>
            <iframe
              title='Bet365'
              src='https://imstore.bet365affiliates.com/365_455806-449-32-6-149-1-88420.aspx'
              frameBorder='0'
              scrolling='no'
              className="w-full h-80"
            ></iframe>
          </div>
        </aside>
        <main className="flex-1">
          <h1 className="text-3xl font-bold mb-4">Account</h1>

          {hasReferral && (
            <div className="card p-4 mb-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="text-sm text-gray-400">Your referral code</div>
                  <div className="text-xl font-semibold">{referralCode}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="btn-secondary" onClick={() => navigator.clipboard.writeText(referralCode || "")}>Copy</button>
                  <button className="btn-primary" onClick={() => setIsModalOpen(true)}>Share</button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card p-4">
              <div className="text-sm text-gray-400">Credits</div>
              <div className="text-2xl font-semibold">{typeof credits === 'number' ? credits : '-'}</div>
              <div className="mt-3">
                <Link className="btn-primary" href="/packages">Buy more</Link>
              </div>
            </div>

            <div className="card p-4">
              <div className="text-sm text-gray-400">Scorecard</div>
              <div className="mb-2">View your previous picks and see how you stack up.</div>
              <Link className="btn-secondary" href="/scorecard">View scorecard</Link>
            </div>

            <div className="card p-4">
              <div className="text-sm text-gray-400">Picks</div>
              <div className="mb-2">View our current picks.</div>
              <Link className="btn-secondary" href="/picks">View picks</Link>
            </div>
          </div>

          {isModalOpen && (
            <div className="modal-overlay">
              <div className="modal card p-4 max-w-lg w-full">
                <h2 className="text-xl font-semibold mb-2">Share your code with your mates by adding their email address</h2>
                <div className="mb-4">
                  <label className="text-sm text-gray-400 mb-1 block">Mate Email</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">✉️</span>
                    <input
                      type="email"
                      className="form-field pl-9 w-full"
                      placeholder="friend@example.com"
                      value={mateEmail}
                      onChange={(e) => setMateEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>Close</button>
                  <button className="btn-primary" onClick={() => {/* send later */ }}>Send</button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}


