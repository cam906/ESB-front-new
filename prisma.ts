import { PrismaClient } from "./app/generated/prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const url = process.env.DATABASE_URL;
const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasourceUrl: url,
  });

export default prisma;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
