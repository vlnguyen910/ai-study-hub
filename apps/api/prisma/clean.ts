import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function assertNonProductionDatabase() {
  const nodeEnv = process.env.NODE_ENV;
  const databaseUrl = process.env.DATABASE_URL ?? '';

  if (nodeEnv === 'production' || databaseUrl.includes('prod')) {
    throw new Error('Refusing to clean a production-like database.');
  }
}

async function main() {
  assertNonProductionDatabase();

  const result = await prisma.$runCommandRaw({
    delete: 'accounts',
    deletes: [
      {
        q: {},
        limit: 0,
      },
    ],
  });

  console.log(`Deleted ${String(result.n ?? 0)} accounts.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
