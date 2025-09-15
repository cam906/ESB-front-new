"use client";

import { gql } from "@apollo/client";
import { useApolloClient } from "@apollo/client/react";
import { useEffect, useMemo, useState } from "react";

type Params = { params: { id: string } };

type Pick = {
  id: number;
  SportId: number;
  AwayCompetitorId: number;
  HomeCompetitorId: number;
  status: number;
  title: string;
  matchTime: string;
  analysis: string;
  summary: string;
};

type Competitor = { id: number; name: string; logo?: string | null };

const GET_PICK = gql`
  query ($id: ID!) {
    pick(id: $id) { id SportId AwayCompetitorId HomeCompetitorId status title matchTime analysis summary }
  }
`;

const GET_COMPETITORS = gql`
  query ($sportId: Int) { competitors(sportId: $sportId) { id name logo } }
`;

export default function PickDetailPage({ params }: Params) {
  const client = useApolloClient();
  const id = params?.id;

  const [pick, setPick] = useState<Pick | null>(null);
  const [competitorsById, setCompetitorsById] = useState<Map<number, Competitor>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const { data: pRes } = await client.query<{ pick: Pick }>({ query: GET_PICK, variables: { id }, fetchPolicy: "no-cache" });
        const p = pRes?.pick;
        if (!p) return;
        const { data: cRes } = await client.query<{ competitors: Competitor[] }>({ query: GET_COMPETITORS, variables: { sportId: p.SportId }, fetchPolicy: "no-cache" });
        if (cancelled) return;
        const map = new Map<number, Competitor>();
        for (const c of (cRes?.competitors || [])) map.set(Number(c.id), c);
        setPick({ ...p, id: Number(p.id) });
        setCompetitorsById(map);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [client, id]);

  const timeStr = useMemo(() => {
    if (!pick) return "";
    const dt = new Date(pick.matchTime);
    return new Intl.DateTimeFormat(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(dt);
  }, [pick]);

  const bucket = process.env.NEXT_PUBLIC_ESB_COMPETITOR_ASSETS || "";
  const base = `https://s3-ap-southeast-2.amazonaws.com/${bucket}`;

  const home = pick ? competitorsById.get(Number(pick.HomeCompetitorId)) : undefined;
  const away = pick ? competitorsById.get(Number(pick.AwayCompetitorId)) : undefined;
  const homeSrc = home?.logo ? `${base}/competitors/${home.logo}` : undefined;
  const awaySrc = away?.logo ? `${base}/competitors/${away.logo}` : undefined;

  if (!id) return null;

  return (
    <div className="container mx-auto gutters section-spacing">
      <div className="max-w-3xl mx-auto">
        <div className={`text-center mb-4 ${loading && !pick ? 'animate-pulse' : ''}`}>
          {pick ? (
            <>
              <h1 className="text-3xl font-bold">{pick.title}</h1>
              <div className="text-sm text-gray-400 mt-1">{timeStr}</div>
            </>
          ) : (
            <div className="mx-auto w-full max-w-md">
              <div className="h-7 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mx-auto mb-2" />
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mx-auto" />
            </div>
          )}
        </div>

        {loading && !pick ? (
          <div className="grid grid-cols-2 md:grid-cols-[1fr_minmax(0,2fr)_1fr] items-start gap-4 mb-6 animate-pulse">
            <div className="justify-self-center text-center">
              <div className="w-[84px] h-[84px] bg-gray-300 dark:bg-gray-700" />
              <div className="h-4 w-28 bg-gray-300 dark:bg-gray-700 rounded mt-2 mx-auto" />
            </div>
            <div className="col-span-2 md:col-span-1">
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/10 p-5">
                <div className="h-5 w-24 bg-gray-300 dark:bg-gray-700 rounded mb-2" />
                <div className="h-4 w-3/4 bg-gray-300 dark:bg-gray-700 rounded mb-3" />
                <div className="h-5 w-24 bg-gray-300 dark:bg-gray-700 rounded mb-2" />
                <div className="space-y-2">
                  <div className="h-4 w-full bg-gray-300 dark:bg-gray-700 rounded" />
                  <div className="h-4 w-11/12 bg-gray-300 dark:bg-gray-700 rounded" />
                  <div className="h-4 w-4/5 bg-gray-300 dark:bg-gray-700 rounded" />
                </div>
              </div>
            </div>
            <div className="justify-self-center text-center">
              <div className="w-[84px] h-[84px] bg-gray-300 dark:bg-gray-700" />
              <div className="h-4 w-28 bg-gray-300 dark:bg-gray-700 rounded mt-2 mx-auto" />
            </div>
          </div>
        ) : pick ? (
          <div className="grid grid-cols-2 md:grid-cols-[1fr_minmax(0,2fr)_1fr] items-start gap-4 mb-6">
            <div className="justify-self-center order-1 md:order-1 text-center">
              {homeSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={homeSrc} alt={home?.name || "Home"} width={84} height={84} className="object-contain" />
              ) : (
                <div className="w-[84px] h-[84px] bg-gray-300 dark:bg-gray-700" />
              )}
              <div className="mt-1 text-sm md:text-base max-w-[12rem] leading-tight break-words">{home?.name || "Home"}</div>
            </div>
            <div className="text-center text-sm col-span-2 md:col-span-1 order-3 md:order-2">
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/10 p-5">
                <div className="font-semibold mb-2">Summary</div>
                <div className="text-center text-sm mb-3">{pick.summary}</div>
                <div className="font-semibold mb-2">Analysis</div>
                <div className="text-left text-sm leading-6 whitespace-pre-wrap">{pick.analysis}</div>
              </div>
            </div>
            <div className="justify-self-center order-2 md:order-3 text-center">
              {awaySrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={awaySrc} alt={away?.name || "Away"} width={84} height={84} className="object-contain" />
              ) : (
                <div className="w-[84px] h-[84px] bg-gray-300 dark:bg-gray-700" />
              )}
              <div className="mt-1 text-sm md:text-base max-w-[12rem] leading-tight break-words">{away?.name || "Away"}</div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}


