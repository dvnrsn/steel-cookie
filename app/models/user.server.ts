import type { Password, User } from "@prisma/client";
import bcrypt from "bcryptjs";
import invariant from "tiny-invariant";

import { prisma } from "~/db.server";

export type { User } from "@prisma/client";

export async function getUserById(id: User["id"]) {
  return prisma.user.findUnique({ where: { id } });
}

export async function getUserByEmail(email: User["email"]) {
  if (!email) return null;
  return prisma.user.findUnique({ where: { email } });
}

export async function createUser(email: User["email"], password: string) {
  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      email,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });
}

export async function findOrCreateUser({
  email,
  password,
  name,
}: {
  email: User["email"];
  password?: string;
  name?: string;
}) {
  invariant(email, "Email is required");
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    return user;
  }
  if (password) {
    password = await bcrypt.hash(password, 10);
  }
  const [firstName, lastName] = name?.split(" ") ?? [];
  return prisma.user.create({
    data: {
      email,
      authProvider: password ? "email-pass" : "email-link",
      ...(password
        ? {
            password: {
              create: {
                hash: password,
              },
            },
          }
        : {}),
      ...(firstName ? { firstName } : {}),
      ...(lastName ? { lastName } : {}),
    },
  });
}

interface CreateUserParams {
  authProvider: User["authProvider"];
  socialId: User["socialId"];
  email: User["email"];
  firstName: User["firstName"];
  lastName: User["lastName"];
}

export async function createSocialUser({
  authProvider,
  socialId,
  email,
  firstName,
  lastName,
}: CreateUserParams) {
  return prisma.user.create({
    data: {
      authProvider,
      socialId,
      email,
      firstName,
      lastName,
    },
  });
}

export async function deleteUserByEmail(email: User["email"]) {
  if (!email) return null;
  return prisma.user.delete({ where: { email } });
}

export async function verifyLogin(
  email: User["email"],
  password: Password["hash"],
) {
  if (!email) return null;
  const userWithPassword = await prisma.user.findUnique({
    where: { email },
    include: {
      password: true,
    },
  });

  if (!userWithPassword || !userWithPassword.password) {
    return null;
  }

  const isValid = await bcrypt.compare(
    password,
    userWithPassword.password.hash,
  );

  if (!isValid) {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _password, ...userWithoutPassword } = userWithPassword;

  return userWithoutPassword;
}

export async function verifySocialLogin(
  authProvider: User["authProvider"],
  socialId: User["socialId"],
) {
  if (!socialId) {
    return null;
  }
  const user = await prisma.user.findUnique({
    where: { socialId },
  });

  if (user?.authProvider !== authProvider) {
    return null;
  }
  return user;
}

export async function markLastLogin(id: User["id"]) {
  return prisma.user.update({
    where: { id },
    data: {
      lastLogin: new Date(),
    },
  });
}
