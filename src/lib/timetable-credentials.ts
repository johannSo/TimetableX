import { prisma } from "@/lib/db";
import { decryptString, encryptString } from "@/lib/crypto";

export interface TimetableCredentialsPlain {
  school: string;
  user: string;
  pass: string;
}

export async function upsertTimetableCredentials(
  userId: string,
  creds: TimetableCredentialsPlain
) {
  const school = encryptString(creds.school);
  const username = encryptString(creds.user);
  const password = encryptString(creds.pass);

  return prisma.timetableCredential.upsert({
    where: { userId },
    update: {
      schoolCipherText: school.cipherText,
      schoolIv: school.iv,
      schoolTag: school.tag,
      userCipherText: username.cipherText,
      userIv: username.iv,
      userTag: username.tag,
      passCipherText: password.cipherText,
      passIv: password.iv,
      passTag: password.tag,
    },
    create: {
      userId,
      schoolCipherText: school.cipherText,
      schoolIv: school.iv,
      schoolTag: school.tag,
      userCipherText: username.cipherText,
      userIv: username.iv,
      userTag: username.tag,
      passCipherText: password.cipherText,
      passIv: password.iv,
      passTag: password.tag,
    },
  });
}

export async function getTimetableCredentials(userId: string) {
  const record = await prisma.timetableCredential.findUnique({ where: { userId } });
  if (!record) return null;

  return {
    school: decryptString({
      cipherText: record.schoolCipherText,
      iv: record.schoolIv,
      tag: record.schoolTag,
    }),
    user: decryptString({
      cipherText: record.userCipherText,
      iv: record.userIv,
      tag: record.userTag,
    }),
    pass: decryptString({
      cipherText: record.passCipherText,
      iv: record.passIv,
      tag: record.passTag,
    }),
  };
}

export async function getTimetableCredentialStatus(userId: string) {
  const record = await prisma.timetableCredential.findUnique({ where: { userId } });
  if (!record) return { hasCredentials: false } as const;

  const school = decryptString({
    cipherText: record.schoolCipherText,
    iv: record.schoolIv,
    tag: record.schoolTag,
  });
  const user = decryptString({
    cipherText: record.userCipherText,
    iv: record.userIv,
    tag: record.userTag,
  });

  return {
    hasCredentials: true,
    school,
    user,
  } as const;
}
