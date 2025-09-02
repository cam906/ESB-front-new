import { createSchema, createYoga } from 'graphql-yoga';
import { NextRequest } from 'next/server';
import { getSequelize } from '@/app/lib/db';
import { initAllModels } from '@/app/lib/models';

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

  type Query {
    users(limit: Int = 20, offset: Int = 0): [User!]!
    user(id: ID!): User
    picks(limit: Int = 20, offset: Int = 0): [Pick!]!
    pick(id: ID!): Pick
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
    __parseLiteral(ast: any) {
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
    picks: async (_: unknown, args: { limit?: number; offset?: number }) => {
      const { Pick } = models;
      return Pick.findAll({ limit: args.limit, offset: args.offset, order: [['createdAt', 'DESC']] });
    },
    pick: async (_: unknown, args: { id: string }) => {
      const { Pick } = models;
      return Pick.findByPk(Number(args.id));
    },
  },
};

const yoga = createYoga<{ req: NextRequest }>({
  schema: createSchema({ typeDefs, resolvers: resolvers as any }),
  graphqlEndpoint: '/api/graphql',
  fetchAPI: { Request: Request, Response: Response, Headers: Headers },
});

export { yoga as GET, yoga as POST };


