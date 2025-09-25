import { createSchema, createYoga } from 'graphql-yoga';
import type { NextRequest } from 'next/server';
import prisma from '@/prisma';
import { getCurrentUserFromRequest, isAdminUser } from '@/app/lib/cognitoServer';

const typeDefs = /* GraphQL */ `
  scalar Date

  type User {
    id: ID!
    email: String!
    name: String
    credits: Int!
    roles: String
    myReferralCode: String
    createdAt: Date!
    updatedAt: Date!
  }

  type Pick {
    id: ID!
    SportId: Int!
    AwayCompetitorId: Int!
    HomeCompetitorId: Int!
    status: Int!
    title: String!
    slug: String
    matchTime: Date!
    analysis: String!
    summary: String!
    isFeatured: Boolean!
    cntUnlocked: Int!
    createdAt: Date!
    updatedAt: Date!
  }

  type Sport {
    id: ID!
    shortTitle: String!
    title: String!
  }

  type Competitor {
    id: ID!
    SportId: Int!
    name: String!
    logo: String
  }

  type UnlockedPick {
    id: ID!
    UserId: Int!
    PickId: Int!
    createdAt: Date!
    updatedAt: Date!
  }

  type Package {
    id: ID!
    title: String!
    description: String!
    credits: Int!
    priceInCents: Int!
    createdAt: Date!
    updatedAt: Date!
  }

  type Metrics {
    date: Date!
    winRatePercent: Int!
    averageRoiText: String!
    winStreak: Int!
    members: Int!
  }

  type CreditPurchase {
    id: ID!
    UserId: Int!
    PackageId: Int!
    priceInCents: Int
    credits: Int!
    createdAt: Date!
    updatedAt: Date!
    user: User
    package: Package
  }

  type PaginatedCreditPurchases {
    items: [CreditPurchase!]!
    totalCount: Int!
    page: Int!
    pageSize: Int!
    totalPages: Int!
  }

  type Query {
    users(limit: Int = 20, offset: Int = 0): [User!]!
    user(id: ID!): User
    picks(limit: Int = 20, offset: Int = 0, status: Int, statuses: [Int!], sportId: Int, sortBy: String = "matchTime", sortDir: String = "ASC"): [Pick!]!
    picksCount(status: Int, statuses: [Int!], sportId: Int): Int!
    pick(id: ID!): Pick
    sports: [Sport!]!
    competitors(sportId: Int): [Competitor!]!
    unlockedPicks(userId: ID!): [UnlockedPick!]!
    me: User
    creditPurchases(limit: Int = 20, offset: Int = 0, userId: Int): PaginatedCreditPurchases!
    packages: [Package!]!
    siteMetrics: Metrics!
  }

  type Mutation {
    unlockPick(userId: ID!, pickId: ID!): UnlockedPick!
    createCompetitor(
      SportId: Int!,
      name: String!,
      logo: String
    ): Competitor!
    createPick(
      SportId: Int!,
      AwayCompetitorId: Int!,
      HomeCompetitorId: Int!,
      status: Int!,
      title: String!,
      slug: String,
      matchTime: Date!,
      analysis: String!,
      summary: String!,
      isFeatured: Boolean
    ): Pick!
    updatePick(
      id: ID!,
      SportId: Int,
      AwayCompetitorId: Int,
      HomeCompetitorId: Int,
      status: Int,
      title: String,
      slug: String,
      matchTime: Date,
      analysis: String,
      summary: String,
      isFeatured: Boolean
    ): Pick!
  }
`;

export const resolvers = {
  Date: {
    __parseValue(value: unknown) {
      return value ? new Date(value as string) : null;
    },
    __serialize(value: unknown) {
      return value instanceof Date ? value.toISOString() : value;
    },
    __parseLiteral(ast: { kind: string; value?: string }) {
      return ast?.value ? new Date(ast.value) : null;
    },
  },
  Pick: {
    isFeatured: (parent: { isFeatured: number | boolean }) => {
      if (typeof parent.isFeatured === 'boolean') return parent.isFeatured;
      return Boolean(parent.isFeatured);
    },
  },
  Query: {
    users: async (_: unknown, args: { limit?: number; offset?: number }, ctx: { request: Request }) => {
      const currentUser = await getCurrentUserFromRequest(ctx.request);
      if (!currentUser || !isAdminUser(currentUser)) {
        throw new Error('Forbidden');
      }
      return prisma.user.findMany({
        take: args.limit,
        skip: args.offset,
        orderBy: { createdAt: 'desc' },
      });
    },
    user: async (_: unknown, args: { id: string }, ctx: { request: Request }) => {
      const currentUser = await getCurrentUserFromRequest(ctx.request);
      const isAdmin = isAdminUser(currentUser);
      const requestedId = Number(args.id);
      if (!currentUser) throw new Error('Unauthorized');
      if (!isAdmin && currentUser.id !== requestedId) {
        throw new Error('Forbidden');
      }
      return prisma.user.findUnique({ where: { id: requestedId } });
    },
    picks: async (
      _: unknown,
      args: { limit?: number; offset?: number; status?: number; statuses?: number[]; sportId?: number; sortBy?: string; sortDir?: string },
      ctx: { request: Request }
    ) => {
      const currentUser = await getCurrentUserFromRequest(ctx.request);
      if (!currentUser) throw new Error('Unauthorized');
      const where: Record<string, unknown> = {};
      if (Array.isArray(args.statuses) && args.statuses.length > 0) {
        where.status = { in: args.statuses };
      } else if (typeof args.status === 'number') {
        where.status = args.status;
      }
      if (typeof args.sportId === 'number') where.SportId = args.sportId;

      const allowedSorts = new Set(['createdAt', 'matchTime', 'id', 'cntUnlocked']);
      const sortBy = allowedSorts.has(String(args.sortBy)) ? String(args.sortBy) : 'matchTime';
      const sortDir = args.sortDir && args.sortDir.toUpperCase() === 'DESC' ? 'desc' : 'asc';

      return prisma.pick.findMany({
        where,
        take: args.limit,
        skip: args.offset,
        orderBy: { [sortBy]: sortDir as 'asc' | 'desc' },
      });
    },
    pick: async (_: unknown, args: { id: string }, ctx: { request: Request }) => {
      const currentUser = await getCurrentUserFromRequest(ctx.request);
      if (!currentUser) throw new Error('Unauthorized');
      return prisma.pick.findUnique({ where: { id: Number(args.id) } });
    },
    me: async (_: unknown, __: unknown, ctx: { request: Request }) => {
      const currentUser = await getCurrentUserFromRequest(ctx.request);
      if (!currentUser?.id) throw new Error('Unauthorized');
      return prisma.user.findUnique({ where: { id: currentUser.id } });
    },
    sports: async (_: unknown, __: unknown, ctx: { request: Request }) => {
      const currentUser = await getCurrentUserFromRequest(ctx.request);
      if (!currentUser) throw new Error('Unauthorized');
      return prisma.sport.findMany({ orderBy: { title: 'asc' } });
    },
    competitors: async (_: unknown, args: { sportId?: number }, ctx: { request: Request }) => {
      const currentUser = await getCurrentUserFromRequest(ctx.request);
      if (!currentUser) throw new Error('Unauthorized');
      const where: Record<string, unknown> = {};
      if (typeof args.sportId === 'number') where.SportId = args.sportId;
      return prisma.competitor.findMany({ where, orderBy: { name: 'asc' } });
    },
    picksCount: async (
      _: unknown,
      args: { status?: number; statuses?: number[]; sportId?: number },
      ctx: { request: Request }
    ) => {
      const currentUser = await getCurrentUserFromRequest(ctx.request);
      if (!currentUser) throw new Error('Unauthorized');
      const where: Record<string, unknown> = {};
      if (Array.isArray(args.statuses) && args.statuses.length > 0) {
        where.status = { in: args.statuses };
      } else if (typeof args.status === 'number') {
        where.status = args.status;
      }
      if (typeof args.sportId === 'number') where.SportId = args.sportId;
      return prisma.pick.count({ where });
    },
    packages: async () => {
      return prisma.packages.findMany({ orderBy: { createdAt: 'asc' } });
    },
    siteMetrics: async () => {
      const latest = await prisma.$queryRaw<{ metric: string; date: Date; value: number | null; textValue: string | null }[]>`
        SELECT t.metric, t.date, t.value, t.textValue FROM DailyMetric t
        INNER JOIN (
          SELECT metric, MAX(date) AS max_date
          FROM DailyMetric
          GROUP BY metric
        ) m ON m.metric = t.metric AND m.max_date = t.date
      `;

      const byMetric: Record<string, { date: Date; value: number | null; textValue: string | null }> = {};
      for (const row of latest) {
        byMetric[row.metric] = {
          date: row.date,
          value: row.value ?? null,
          textValue: row.textValue ?? null,
        };
      }

      const date = byMetric['WIN_RATE']?.date || new Date();
      const winRatePercent = Math.round(Number(byMetric['WIN_RATE']?.value ?? 0));
      const averageRoiText = byMetric['AVG_ROI']?.textValue || '90% - 150%';
      const winStreak = Math.round(Number(byMetric['WIN_STREAK']?.value ?? 0));
      const members = Math.round(Number(byMetric['MEMBERS']?.value ?? 0));

      return { date, winRatePercent, averageRoiText, winStreak, members };
    },
    unlockedPicks: async (_: unknown, args: { userId: string }, ctx: { request: Request }) => {
      const currentUser = await getCurrentUserFromRequest(ctx.request);
      if (!currentUser) throw new Error('Unauthorized');
      const isAdmin = isAdminUser(currentUser);
      const effectiveUserId = isAdmin ? Number(args.userId) : currentUser.id;
      return prisma.unlockedPick.findMany({
        where: { UserId: effectiveUserId },
        orderBy: { createdAt: 'desc' },
      });
    },
    creditPurchases: async (_: unknown, args: { limit?: number; offset?: number; userId?: number }, ctx: { request: Request }) => {
      const currentUser = await getCurrentUserFromRequest(ctx.request);
      const admin = isAdminUser(currentUser);

      const where: Record<string, unknown> = {};
      if (!admin) {
        if (!currentUser?.id) return { items: [], totalCount: 0, page: 1, pageSize: args.limit ?? 20, totalPages: 1 };
        where.UserId = currentUser.id;
      } else if (typeof args.userId === 'number') {
        where.UserId = args.userId;
      }

      const [items, totalCount] = await Promise.all([
        prisma.creditPurchase.findMany({
          where,
          take: args.limit,
          skip: args.offset,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.creditPurchase.count({ where }),
      ]);

      const pageSize = args.limit ?? 20;
      const page = Math.floor((args.offset ?? 0) / pageSize) + 1;
      const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

      return { items, totalCount, page, pageSize, totalPages };
    },
  },
  CreditPurchase: {
    user: async (parent: { UserId: number }) => {
      if (!parent?.UserId) return null;
      return prisma.user.findUnique({ where: { id: Number(parent.UserId) } });
    },
    package: async (parent: { PackageId: number }) => {
      if (!parent?.PackageId) return null;
      return prisma.packages.findUnique({ where: { id: Number(parent.PackageId) } });
    },
  },
  Mutation: {
    unlockPick: async (_: unknown, args: { userId: string; pickId: string }, ctx: { request: Request }) => {
      const currentUser = await getCurrentUserFromRequest(ctx.request);
      if (!currentUser) throw new Error('Unauthorized');
      const isAdmin = isAdminUser(currentUser);
      const targetUserId = Number(args.userId);
      const pickIdNum = Number(args.pickId);
      if (!isAdmin && currentUser.id !== targetUserId) throw new Error('Forbidden');

      const [user, pick] = await Promise.all([
        prisma.user.findUnique({ where: { id: targetUserId } }),
        prisma.pick.findUnique({ where: { id: pickIdNum } }),
      ]);

      if (!user) throw new Error('User not found');
      if (!pick) throw new Error('Pick not found');

      // If already unlocked, return existing without charging credits again
      const existing = await prisma.unlockedPick.findFirst({
        where: { UserId: targetUserId, PickId: pickIdNum },
      });
      if (existing) return existing;

      if ((user.credits ?? 0) < 1) throw new Error('Insufficient credits');

      const created = await prisma.$transaction(async (tx) => {
        // Double-check within transaction to avoid race
        const already = await tx.unlockedPick.findFirst({
          where: { UserId: targetUserId, PickId: pickIdNum },
        });
        if (already) return already;

        await tx.user.update({
          where: { id: targetUserId },
          data: { credits: { decrement: 1 }, updatedAt: new Date() },
        });

        const unlocked = await tx.unlockedPick.create({
          data: {
            UserId: targetUserId,
            PickId: pickIdNum,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });

        await tx.pick.update({
          where: { id: pickIdNum },
          data: { cntUnlocked: { increment: 1 }, updatedAt: new Date() },
        });

        return unlocked;
      });

      return created;
    },
    createCompetitor: async (
      _: unknown,
      args: { SportId: number; name: string; logo?: string | null },
      ctx: { request: Request }
    ) => {
      const currentUser = await getCurrentUserFromRequest(ctx.request);
      if (!currentUser || !isAdminUser(currentUser)) throw new Error('Forbidden');

      const now = new Date();
      try {
        const created = await prisma.competitor.create({
          data: {
            SportId: Number(args.SportId),
            name: args.name.trim(),
            logo: args.logo ?? null,
            createdAt: now,
            updatedAt: now,
          },
        });
        return created;
      } catch (e: unknown) {
        // Handle unique constraint on (SportId, name)
        const err = e as { code?: string; message?: string };
        if (err && err.code === 'P2002') {
          throw new Error('Competitor with this name already exists for the sport');
        }
        throw new Error(err?.message || 'Failed to create competitor');
      }
    },
    createPick: async (
      _: unknown,
      args: {
        SportId: number; AwayCompetitorId: number; HomeCompetitorId: number; status: number; title: string; slug?: string | null; matchTime: Date; analysis: string; summary: string; isFeatured?: boolean | null;
      },
      ctx: { request: Request }
    ) => {
      const currentUser = await getCurrentUserFromRequest(ctx.request);
      if (!currentUser || !isAdminUser(currentUser)) throw new Error('Forbidden');

      const created = await prisma.pick.create({
        data: {
          SportId: args.SportId,
          AwayCompetitorId: args.AwayCompetitorId,
          HomeCompetitorId: args.HomeCompetitorId,
          status: args.status,
          title: args.title,
          slug: args.slug || null,
          matchTime: new Date(args.matchTime),
          analysis: args.analysis,
          summary: args.summary,
          isFeatured: args.isFeatured ? 1 : 0,
          cntUnlocked: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      return created;
    },
    updatePick: async (
      _: unknown,
      args: {
        id: string; SportId?: number; AwayCompetitorId?: number; HomeCompetitorId?: number; status?: number; title?: string; slug?: string | null; matchTime?: Date; analysis?: string; summary?: string; isFeatured?: boolean | null;
      },
      ctx: { request: Request }
    ) => {
      const currentUser = await getCurrentUserFromRequest(ctx.request);
      if (!currentUser || !isAdminUser(currentUser)) throw new Error('Forbidden');
      const id = Number(args.id);
      const data: Record<string, unknown> = { updatedAt: new Date() };
      if (typeof args.SportId === 'number') data.SportId = args.SportId;
      if (typeof args.AwayCompetitorId === 'number') data.AwayCompetitorId = args.AwayCompetitorId;
      if (typeof args.HomeCompetitorId === 'number') data.HomeCompetitorId = args.HomeCompetitorId;
      if (typeof args.status === 'number') data.status = args.status;
      if (typeof args.title === 'string') data.title = args.title;
      if (typeof args.slug === 'string' || args.slug === null) data.slug = args.slug ?? null;
      if (args.matchTime) data.matchTime = new Date(args.matchTime);
      if (typeof args.analysis === 'string') data.analysis = args.analysis;
      if (typeof args.summary === 'string') data.summary = args.summary;
      if (typeof args.isFeatured === 'boolean') data.isFeatured = args.isFeatured ? 1 : 0;

      const previous = await prisma.pick.findUnique({ where: { id }, select: { status: true } });
      const isTransitionToLost = typeof args.status === 'number' && previous?.status !== 20 && args.status === 20;

      if (isTransitionToLost) {
        const updated = await prisma.$transaction(async (tx) => {
          const updatedInner = await tx.pick.update({ where: { id }, data });
          const unlocked = await tx.unlockedPick.findMany({ where: { PickId: id }, select: { UserId: true } });
          const userIds = Array.from(new Set(unlocked.map((u) => u.UserId)));
          for (const userId of userIds) {
            await tx.user.update({ where: { id: userId }, data: { credits: { increment: 1 }, updatedAt: new Date() } });
          }
          return updatedInner;
        });
        return updated;
      }

      const updated = await prisma.pick.update({ where: { id }, data });
      return updated;
    },
  },
};

const yoga = createYoga({
  schema: createSchema({ typeDefs, resolvers }),
  graphqlEndpoint: '/api/graphql',
  fetchAPI: { Request: Request, Response: Response, Headers: Headers },
});

type RouteContext = { params: Promise<Record<string, never>> };

export async function GET(request: NextRequest, context: RouteContext) {
  await context.params;
  return yoga.fetch(request);
}

export async function POST(request: NextRequest, context: RouteContext) {
  await context.params;
  return yoga.fetch(request);
}

