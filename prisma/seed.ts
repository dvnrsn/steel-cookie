import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
  const email = "rachel@remix.run";

  // cleanup the existing database
  await prisma.user.delete({ where: { email } }).catch(() => {
    // no worries if it doesn't exist yet
  });

  const user = await prisma.user.findUnique({ where: { email } });
  if (user == null && process.env.ADMIN_PASS) {
    await prisma.user.create({
      data: {
        email: process.env.ADMIN_EMAIL,
        password: {
          create: {
            hash: await bcrypt.hash(process.env.ADMIN_PASS, 10),
          },
        },
        isAdmin: true,
      },
    });
  }

  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
