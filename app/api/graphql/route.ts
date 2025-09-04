import { createSchema, createYoga } from 'graphql-yoga';
// import { NextRequest } from 'next/server';
import { getSequelize } from '@/app/lib/db';
import { initAllModels } from '@/app/lib/models';
import { Op } from 'sequelize';

const sequelize = getSequelize();
const models = initAllModels(sequelize);

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
  Query: {
    users: async (_: unknown, args: { limit?: number; offset?: number }) => {
      const { User } = models;
      return User.findAll({ limit: args.limit, offset: args.offset, order: [['createdAt', 'DESC']] });
    },
    user: async (_: unknown, args: { id: string }) => {
      const { User } = models;
      return User.findByPk(Number(args.id));
    },
    picks: async (
      _: unknown,
      args: { limit?: number; offset?: number; status?: number; statuses?: number[]; sportId?: number; sortBy?: string; sortDir?: string }
    ) => {
      const { Pick } = models;
      const where: Record<string, unknown> = {};
      if (Array.isArray(args.statuses) && args.statuses.length > 0) {
        where.status = { [Op.in]: args.statuses };
      } else if (typeof args.status === 'number') {
        where.status = args.status;
      }
      if (typeof args.sportId === 'number') where.SportId = args.sportId;
      const sortBy = args.sortBy === 'createdAt' ? 'createdAt' : 'matchTime';
      const sortDir = args.sortDir && args.sortDir.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      return Pick.findAll({
        where,
        limit: args.limit,
        offset: args.offset,
        order: [[sortBy, sortDir as 'ASC' | 'DESC']],
      });
    },
    pick: async (_: unknown, args: { id: string }) => {
      const { Pick } = models;
      return Pick.findByPk(Number(args.id));
    },
    me: async () => {
      // Basic passthrough to /api/me would require HTTP call; instead, reuse models similarly by reading cookie is nontrivial here.
      // Keep a minimal resolver returning null; frontend uses /api/me for auth already and only needs credits for convenience.
      return null;
    },
    sports: async () => {
      const { Sport } = models;
      return Sport.findAll({ order: [['title', 'ASC']] });
    },
    competitors: async (_: unknown, args: { sportId?: number }) => {
      const { Competitor } = models;
      const where: Record<string, unknown> = {};
      if (typeof args.sportId === 'number') where.SportId = args.sportId;
      return Competitor.findAll({ where, order: [['name', 'ASC']] });
    },
    unlockedPicks: async (_: unknown, args: { userId: string }) => {
      const { UnlockedPick } = models;
      return UnlockedPick.findAll({ where: { UserId: Number(args.userId) }, order: [['createdAt', 'DESC']] });
    },
  },
  Mutation: {
    unlockPick: async (_: unknown, args: { userId: string; pickId: string }) => {
      const { UnlockedPick } = models;
      // Upsert-like behavior: find existing, else create
      const existing = await UnlockedPick.findOne({ where: { UserId: Number(args.userId), PickId: Number(args.pickId) } });
      if (existing) return existing;
      const created = await UnlockedPick.create({ UserId: Number(args.userId), PickId: Number(args.pickId) });
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


