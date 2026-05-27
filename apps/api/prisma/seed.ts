import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const SEED_ACCOUNT_COUNT = Number.parseInt(
  process.env.SEED_ACCOUNT_COUNT ?? '20',
  10,
);
const SEED_EMAIL_DOMAIN = 'seed.ai-study-hub.local';
const SEED_PASSWORD = 'Password123!';
const SEED_PASSWORD_SALT_ROUNDS = 10;
const SEED_REFRESH_TOKEN_SALT_ROUNDS = 10;
type UserRole = 'USER' | 'ADMIN' | 'MODERATOR';
type UserStatus = 'ACTIVE' | 'UNVERIFIED' | 'BANNED' | 'DELETED';

type SeedAccount = {
  email: string;
  name: string;
  password: string;
  avatarUrl: string;
  role: UserRole;
  status: UserStatus;
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
      status: faker.helpers.arrayElement([
        'ACTIVE',
        'UNVERIFIED',
        'BANNED',
        'DELETED',
      ] as const),
    });
  }

  return accounts;
}

async function main() {
  const accounts = buildSeedAccounts();
  const seedEmails = accounts.map((account) => account.email);

  const hashedAccounts = await Promise.all(
    accounts.map(async (account) => ({
      ...account,
      password: await bcrypt.hash(account.password, SEED_PASSWORD_SALT_ROUNDS),
      deletedAt: account.status === 'DELETED' ? new Date() : null,
    })),
  );

  // Delete sessions first (they have a foreign key to accounts)
  const accountsToDelete = await prisma.accounts.findMany({
    where: {
      email: {
        in: seedEmails,
      },
    },
    select: {
      id: true,
    },
  });

  const userIds = accountsToDelete.map((account) => account.id);
  await prisma.sessions.deleteMany({
    where: {
      userId: {
        in: userIds,
      },
    },
  });

  // Then delete the accounts
  await prisma.accounts.deleteMany({
    where: {
      email: {
        in: seedEmails,
      },
    },
  });

  await prisma.accounts.createMany({
    data: hashedAccounts,
  });

  console.log(`Seeded ${accounts.length} accounts.`);
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
