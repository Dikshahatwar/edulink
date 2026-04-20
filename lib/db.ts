import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
  };

  prisma =
    globalForPrisma.prisma ??
    new PrismaClient();

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = prisma;
  }
}

export { prisma };