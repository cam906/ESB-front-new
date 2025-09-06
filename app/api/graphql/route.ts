import { createSchema, createYoga } from 'graphql-yoga';
import prisma from '@/prisma';
import { getCurrentUser, isCurrentUserAdmin } from '@/app/lib/currentUser';

const typeDefs = /* GraphQL */ `
  scalar Date

  type User {
    id: ID!
    email: String!
    name: String!
    credits: Int!
    roles: String
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
    pick(id: ID!): Pick
    sports: [Sport!]!
    competitors(sportId: Int): [Competitor!]!
    unlockedPicks(userId: ID!): [UnlockedPick!]!
    me: User
    creditPurchases(limit: Int = 20, offset: Int = 0, userId: Int): PaginatedCreditPurchases!
  }

  type Mutation {
    unlockPick(userId: ID!, pickId: ID!): UnlockedPick!
  }
`;

const resolvers = {
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
    users: async (_: unknown, args: { limit?: number; offset?: number }) => {
      const currentUser = await getCurrentUser();
      if (!currentUser || !isCurrentUserAdmin(currentUser)) {
        throw new Error('Forbidden');
      }
      return prisma.user.findMany({
        take: args.limit,
        skip: args.offset,
        orderBy: { createdAt: 'desc' },
      });
    },
    user: async (_: unknown, args: { id: string }) => {
      const currentUser = await getCurrentUser();
      const isAdmin = isCurrentUserAdmin(currentUser);
      const requestedId = Number(args.id);
      if (!currentUser) throw new Error('Unauthorized');
      if (!isAdmin && currentUser.id !== requestedId) {
        throw new Error('Forbidden');
      }
      return prisma.user.findUnique({ where: { id: requestedId } });
    },
    picks: async (
      _: unknown,
      args: { limit?: number; offset?: number; status?: number; statuses?: number[]; sportId?: number; sortBy?: string; sortDir?: string }
    ) => {
      const where: Record<string, unknown> = {};
      if (Array.isArray(args.statuses) && args.statuses.length > 0) {
        where.status = { in: args.statuses };
      } else if (typeof args.status === 'number') {
        where.status = args.status;
      }
      if (typeof args.sportId === 'number') where.SportId = args.sportId;

      const sortBy = args.sortBy === 'createdAt' ? 'createdAt' : 'matchTime';
      const sortDir = args.sortDir && args.sortDir.toUpperCase() === 'DESC' ? 'desc' : 'asc';

      return prisma.pick.findMany({
        where,
        take: args.limit,
        skip: args.offset,
        orderBy: { [sortBy]: sortDir as 'asc' | 'desc' },
      });
    },
    pick: async (_: unknown, args: { id: string }) => {
      return prisma.pick.findUnique({ where: { id: Number(args.id) } });
    },
    me: async () => {
      // Basic passthrough to /api/me would require HTTP call; instead, reuse models similarly by reading cookie is nontrivial here.
      // Keep a minimal resolver returning null; frontend uses /api/me for auth already and only needs credits for convenience.
      return null;
    },
    sports: async () => {
      return prisma.sport.findMany({ orderBy: { title: 'asc' } });
    },
    competitors: async (_: unknown, args: { sportId?: number }) => {
      const where: Record<string, unknown> = {};
      if (typeof args.sportId === 'number') where.SportId = args.sportId;
      return prisma.competitor.findMany({ where, orderBy: { name: 'asc' } });
    },
    unlockedPicks: async (_: unknown, args: { userId: string }) => {
      const currentUser = await getCurrentUser();
      if (!currentUser) throw new Error('Unauthorized');
      const isAdmin = isCurrentUserAdmin(currentUser);
      const effectiveUserId = isAdmin ? Number(args.userId) : currentUser.id;
      return prisma.unlockedPick.findMany({
        where: { UserId: effectiveUserId },
        orderBy: { createdAt: 'desc' },
      });
    },
    creditPurchases: async (_: unknown, args: { limit?: number; offset?: number; userId?: number }) => {
      const currentUser = await getCurrentUser();
      const admin = isCurrentUserAdmin(currentUser);

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
      return prisma.package.findUnique({ where: { id: Number(parent.PackageId) } });
    },
  },
  Mutation: {
    unlockPick: async (_: unknown, args: { userId: string; pickId: string }) => {
      const currentUser = await getCurrentUser();
      if (!currentUser) throw new Error('Unauthorized');
      const isAdmin = isCurrentUserAdmin(currentUser);
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
  },
};

const yoga = createYoga({
  schema: createSchema({ typeDefs, resolvers }),
  graphqlEndpoint: '/api/graphql',
  fetchAPI: { Request: Request, Response: Response, Headers: Headers },
});

export { yoga as GET, yoga as POST };


