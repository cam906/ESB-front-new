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
  const [wins, total] = await Promise.all([
    prisma.pick.count({ where: { deletedAt: null, status: 10 } }),
    prisma.pick.count({
      where: { deletedAt: null, status: { in: [10, 20] } },
    }),
  ]);
  const winRatePercent = total > 0 ? Math.round((wins / total) * 100) : 0;

  // Compute current win streak from the end of (correct+incorrect)
  const recentStatuses = await prisma.pick.findMany({
    where: {
      deletedAt: null,
      status: { in: [10, 20] },
    },
    orderBy: [
      { matchTime: 'desc' },
      { id: 'desc' },
    ],
    select: { status: true },
    take: 2000,
  });
  let winStreak = 0;
  for (const row of recentStatuses) {
    if (row.status === 10) winStreak += 1; else break;
  }

  // Compute members
  const members = await prisma.user.count({ where: { deletedAt: null } });

  const averageRoiText = '90% - 150%';

  const todayDate = new Date(`${today}T00:00:00.000Z`);
  const metricsUpdatedAt = new Date();

  await Promise.all([
    prisma.dailyMetric.upsert({
      where: { metric_date: { metric: 'WIN_RATE', date: todayDate } },
      create: {
        metric: 'WIN_RATE',
        date: todayDate,
        value: winRatePercent,
        textValue: null,
        updatedAt: metricsUpdatedAt,
      },
      update: {
        value: winRatePercent,
        textValue: null,
        updatedAt: metricsUpdatedAt,
      },
    }),
    prisma.dailyMetric.upsert({
      where: { metric_date: { metric: 'WIN_STREAK', date: todayDate } },
      create: {
        metric: 'WIN_STREAK',
        date: todayDate,
        value: winStreak,
        textValue: null,
        updatedAt: metricsUpdatedAt,
      },
      update: {
        value: winStreak,
        textValue: null,
        updatedAt: metricsUpdatedAt,
      },
    }),
    prisma.dailyMetric.upsert({
      where: { metric_date: { metric: 'MEMBERS', date: todayDate } },
      create: {
        metric: 'MEMBERS',
        date: todayDate,
        value: members,
        textValue: null,
        updatedAt: metricsUpdatedAt,
      },
      update: {
        value: members,
        textValue: null,
        updatedAt: metricsUpdatedAt,
      },
    }),
    prisma.dailyMetric.upsert({
      where: { metric_date: { metric: 'AVG_ROI', date: todayDate } },
      create: {
        metric: 'AVG_ROI',
        date: todayDate,
        value: null,
        textValue: averageRoiText,
        updatedAt: metricsUpdatedAt,
      },
      update: {
        value: null,
        textValue: averageRoiText,
        updatedAt: metricsUpdatedAt,
      },
    }),
  ]);

  return NextResponse.json({
    date: today,
    winRatePercent,
    averageRoiText,
    winStreak,
    members,
  });
}

