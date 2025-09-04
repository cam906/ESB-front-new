import { createSchema, createYoga } from 'graphql-yoga';
import prisma from '@/prisma';

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

  type Query {
    users(limit: Int = 20, offset: Int = 0): [User!]!
    user(id: ID!): User
    picks(limit: Int = 20, offset: Int = 0, status: Int, statuses: [Int!], sportId: Int, sortBy: String = "matchTime", sortDir: String = "ASC"): [Pick!]!
    pick(id: ID!): Pick
    sports: [Sport!]!
    competitors(sportId: Int): [Competitor!]!
    unlockedPicks(userId: ID!): [UnlockedPick!]!
    me: User
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
      return prisma.user.findMany({
        take: args.limit,
        skip: args.offset,
        orderBy: { createdAt: 'desc' },
      });
    },
    user: async (_: unknown, args: { id: string }) => {
      return prisma.user.findUnique({ where: { id: Number(args.id) } });
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
      return prisma.unlockedPick.findMany({
        where: { UserId: Number(args.userId) },
        orderBy: { createdAt: 'desc' },
      });
    },
  },
  Mutation: {
    unlockPick: async (_: unknown, args: { userId: string; pickId: string }) => {
      const existing = await prisma.unlockedPick.findFirst({
        where: { UserId: Number(args.userId), PickId: Number(args.pickId) },
      });
      if (existing) return existing;
      return prisma.unlockedPick.create({
        data: {
          UserId: Number(args.userId),
          PickId: Number(args.pickId),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    },
  },
};

const yoga = createYoga({
  schema: createSchema({ typeDefs, resolvers }),
  graphqlEndpoint: '/api/graphql',
  fetchAPI: { Request: Request, Response: Response, Headers: Headers },
});

export { yoga as GET, yoga as POST };


