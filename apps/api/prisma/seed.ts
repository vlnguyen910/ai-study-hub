import { PrismaClient } from '@prisma/client';
import type { InputJsonObject } from '@prisma/client/runtime/library';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

const SEED_ACCOUNT_COUNT = Number.parseInt(
  process.env.SEED_ACCOUNT_COUNT ?? '20',
  10,
);
const SEED_EMAIL_DOMAIN = 'seed.ai-study-hub.local';
const SEED_PASSWORD = 'Password123!';
type UserRole = 'USER' | 'ADMIN' | 'MODERATOR';
type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BANNED';
type DeviceInfo = 'WEB' | 'MOBILE';

type SeedAccount = {
  email: string;
  name: string;
  password: string;
  avatarUrl: string;
  role: UserRole;
  status: UserStatus;
  isVerified: boolean;
};

type SeedSession = {
  userId: string;
  refreshToken: string;
  deviceInfo: DeviceInfo;
  isRevoked: boolean;
  expiresAt: Date;
};

function buildSeedAccounts(): SeedAccount[] {
  faker.seed(20260522);

  const accounts: SeedAccount[] = [
    {
      email: `admin@${SEED_EMAIL_DOMAIN}`,
      name: 'Seed Admin',
      password: SEED_PASSWORD,
      avatarUrl: faker.image.avatar(),
      role: 'ADMIN',
      status: 'ACTIVE',
      isVerified: true,
    },
  ];

  for (let index = 1; index <= SEED_ACCOUNT_COUNT; index += 1) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    accounts.push({
      email: `student-${index}@${SEED_EMAIL_DOMAIN}`,
      name: `${firstName} ${lastName}`,
      password: SEED_PASSWORD,
      avatarUrl: faker.image.avatar(),
      role: faker.helpers.arrayElement(['USER', 'MODERATOR'] as const),
      status: faker.helpers.arrayElement(['ACTIVE', 'INACTIVE'] as const),
      isVerified: faker.datatype.boolean({ probability: 0.75 }),
    });
  }

  return accounts;
}

async function main() {
  const accounts = buildSeedAccounts();
  const seedEmails = accounts.map((account) => account.email);
  const now = new Date().toISOString();

  await prisma.$runCommandRaw({
    delete: 'accounts',
    deletes: [
      {
        q: {
          email: {
            $in: seedEmails,
          },
        },
        limit: 0,
      },
    ],
  });

  await prisma.$runCommandRaw({
    insert: 'accounts',
    documents: accounts.map((account) => ({
      ...account,
      createdAt: { $date: now },
      updatedAt: { $date: now },
    })),
  } as unknown as InputJsonObject);

  const insertedAccounts = await prisma.accounts.findMany({
    where: {
      email: {
        in: seedEmails,
      },
    },
    select: {
      id: true,
      email: true,
    },
  });

  const sessions: SeedSession[] = insertedAccounts.flatMap((account) => {
    const sessionCount = faker.number.int({ min: 1, max: 2 });

    return Array.from({ length: sessionCount }).map(() => ({
      userId: account.id,
      refreshToken: faker.string.alphanumeric(64),
      deviceInfo: faker.helpers.arrayElement(['WEB', 'MOBILE'] as const),
      isRevoked: faker.datatype.boolean({ probability: 0.1 }),
      expiresAt: faker.date.soon({ days: 30 }),
    }));
  });

  if (sessions.length > 0) {
    await prisma.$runCommandRaw({
      insert: 'sessions',
      documents: sessions.map((session) => ({
        ...session,
        createdAt: { $date: now },
        expiresAt: { $date: session.expiresAt.toISOString() },
      })),
    } as unknown as InputJsonObject);
  }

  console.log(`Seeded ${accounts.length} accounts.`);
  console.log(`Seeded ${sessions.length} sessions.`);
  console.log(`Admin account: admin@${SEED_EMAIL_DOMAIN}`);
  console.log(`Seed password: ${SEED_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
