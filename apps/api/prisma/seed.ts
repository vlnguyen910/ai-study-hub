import { Prisma, PrismaClient, userRole, userStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

const SEED_ACCOUNT_COUNT = Number.parseInt(
  process.env.SEED_ACCOUNT_COUNT ?? '20',
  10,
);
const SEED_EMAIL_DOMAIN = 'seed.ai-study-hub.local';
const SEED_PASSWORD = 'Password123!';

type SeedAccount = {
  email: string;
  name: string;
  password: string;
  avatarUrl: string;
  role: userRole;
  status: userStatus;
  isVerified: boolean;
};

function buildSeedAccounts(): SeedAccount[] {
  faker.seed(20260522);

  const accounts: SeedAccount[] = [
    {
      email: `admin@${SEED_EMAIL_DOMAIN}`,
      name: 'Seed Admin',
      password: SEED_PASSWORD,
      avatarUrl: faker.image.avatar(),
      role: userRole.ADMIN,
      status: userStatus.ACTIVE,
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
      role: faker.helpers.arrayElement([userRole.USER, userRole.MODERATOR]),
      status: faker.helpers.arrayElement([
        userStatus.ACTIVE,
        userStatus.INACTIVE,
      ]),
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
  } as unknown as Prisma.InputJsonObject);

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
