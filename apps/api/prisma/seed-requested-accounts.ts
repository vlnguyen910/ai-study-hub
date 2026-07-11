import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

const accounts = [
  { email: 'admin@gmail.com', name: 'ADMIN', role: UserRole.ADMIN },
  {
    email: 'moderator@gmail.com',
    name: 'MODERATOR',
    role: UserRole.MODERATOR,
  },
  { email: 'user@gmail.com', name: 'Lê Văn A', role: UserRole.USER },
  { email: 'user1@gmail.com', name: 'Lê Văn B', role: UserRole.USER },
  { email: 'user2@gmail.com', name: 'Lê Văn C', role: UserRole.USER },
  { email: 'user3@gmail.com', name: 'Lê Văn D', role: UserRole.USER },
  { email: 'user4@gmail.com', name: 'Lê Văn E', role: UserRole.USER },
] as const;

async function main() {
  const password = await argon2.hash('12345678');

  for (const account of accounts) {
    const avatarUrl = `https://api.dicebear.com/9.x/initials/png?seed=${encodeURIComponent(account.name)}`;

    await prisma.accounts.upsert({
      where: { email: account.email },
      update: {
        name: account.name,
        password,
        role: account.role,
        status: UserStatus.ACTIVE,
        deletedAt: null,
        avatarUrl,
      },
      create: {
        ...account,
        password,
        avatarUrl,
        status: UserStatus.ACTIVE,
      },
    });
  }

  const updatedDocuments = await prisma.documents.updateMany({
    where: {
      publicId: { startsWith: 'seed/accounts/' },
    },
    data: {
      title: 'Attention Is All You Need',
      fileUrl:
        'https://res.cloudinary.com/ddxstobvd/image/upload/v1783747368/seed/attention-is-all-you-need.pdf',
      sizeInBytes: 2_215_244,
      format: 'pdf',
      resourceType: 'image',
      description:
        'Bài báo nghiên cứu Attention Is All You Need về kiến trúc Transformer và cơ chế attention.',
    },
  });

  console.log(
    `Upserted ${accounts.length} requested accounts and updated ${updatedDocuments.count} seeded documents.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
