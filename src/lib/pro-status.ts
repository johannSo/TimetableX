import { prisma } from '@/lib/db';

export async function setHasPro(userId: string, hasPro: boolean, username?: string) {
  const user = username
    ? null
    : await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
  const resolvedUsername = username || user?.email || userId;

  return prisma.hasPro.upsert({
    where: { userId },
    create: {
      userId,
      username: resolvedUsername,
      hasPro,
    },
    update: {
      username: resolvedUsername,
      hasPro,
    },
  });
}

export async function getHasPro(userId: string) {
  const record = await prisma.hasPro.findUnique({ where: { userId } });
  if (record) return record.hasPro;

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
  await prisma.hasPro.create({
    data: {
      userId,
      username: user?.email || userId,
      hasPro: false,
    },
  });
  return false;
}
