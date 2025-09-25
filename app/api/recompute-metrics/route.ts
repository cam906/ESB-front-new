import prisma from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';

function getTodayUtcDateString(): string {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export async function POST(req: NextRequest) {
  const key = req.headers.get('x-cron-key');
  if (!key || key !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const today = getTodayUtcDateString();

  // Compute win rate: correct / (correct + incorrect)
  const winRateRow = await prisma.$queryRaw<{ wins: bigint; total: bigint }[]>`
    SELECT
      SUM(CASE WHEN status = 10 THEN 1 ELSE 0 END) AS wins,
      SUM(CASE WHEN status IN (10, 20) THEN 1 ELSE 0 END) AS total
    FROM elitesportsbets.Pick
    WHERE deletedAt IS NULL
  `;
  const wins = Number(winRateRow?.[0]?.wins || 0);
  const total = Number(winRateRow?.[0]?.total || 0);
  const winRatePercent = total > 0 ? Math.round((wins / total) * 100) : 0;

  // Compute current win streak from the end of (correct+incorrect)
  const recentStatuses = await prisma.$queryRaw<{ status: number }[]>`
    SELECT status
    FROM elitesportsbets.Pick
    WHERE deletedAt IS NULL AND status IN (10, 20)
    ORDER BY matchTime DESC, id DESC
    LIMIT 2000
  `;
  let winStreak = 0;
  for (const row of recentStatuses) {
    if (row.status === 10) winStreak += 1; else break;
  }

  // Compute members
  const membersRow = await prisma.$queryRaw<{ c: bigint }[]>`
    SELECT COUNT(*) AS c FROM elitesportsbets.User WHERE deletedAt IS NULL
  `;
  const members = Number(membersRow?.[0]?.c || 0);

  const averageRoiText = '90% - 150%';

  // Upsert into DailyMetric (raw SQL to avoid client regeneration requirements)
  // WIN_RATE
  await prisma.$executeRawUnsafe(
    "INSERT INTO elitesportsbets.DailyMetric (metric, date, value, textValue, meta) VALUES (?, ?, ?, NULL, NULL) ON DUPLICATE KEY UPDATE value=VALUES(value), textValue=VALUES(textValue), updatedAt=CURRENT_TIMESTAMP",
    'WIN_RATE', today, winRatePercent
  );
  // WIN_STREAK
  await prisma.$executeRawUnsafe(
    "INSERT INTO elitesportsbets.DailyMetric (metric, date, value, textValue, meta) VALUES (?, ?, ?, NULL, NULL) ON DUPLICATE KEY UPDATE value=VALUES(value), textValue=VALUES(textValue), updatedAt=CURRENT_TIMESTAMP",
    'WIN_STREAK', today, winStreak
  );
  // MEMBERS
  await prisma.$executeRawUnsafe(
    "INSERT INTO elitesportsbets.DailyMetric (metric, date, value, textValue, meta) VALUES (?, ?, ?, NULL, NULL) ON DUPLICATE KEY UPDATE value=VALUES(value), textValue=VALUES(textValue), updatedAt=CURRENT_TIMESTAMP",
    'MEMBERS', today, members
  );
  // AVG_ROI
  await prisma.$executeRawUnsafe(
    "INSERT INTO elitesportsbets.DailyMetric (metric, date, value, textValue, meta) VALUES (?, ?, NULL, ?, NULL) ON DUPLICATE KEY UPDATE value=VALUES(value), textValue=VALUES(textValue), updatedAt=CURRENT_TIMESTAMP",
    'AVG_ROI', today, averageRoiText
  );

  return NextResponse.json({
    date: today,
    winRatePercent,
    averageRoiText,
    winStreak,
    members,
  });
}


