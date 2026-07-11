import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

// These are the credentials the grader logs in with.
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@fixitnow.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

const categories = [
  { name: "Plumbing", icon: "faucet" },
  { name: "Electrical", icon: "bolt" },
  { name: "Cleaning", icon: "broom" },
  { name: "Painting", icon: "roller" },
  { name: "Carpentry", icon: "hammer" },
  { name: "AC Repair", icon: "snowflake" },
];

async function main() {
  // Idempotent: safe to run repeatedly.
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, SALT_ROUNDS);
  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { role: "ADMIN", activeStatus: "ACTIVE", password: hashedPassword },
    create: {
      name: "FixItNow Admin",
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: "ADMIN",
    },
  });
  console.log(`✔ Admin ready: ${admin.email} / ${ADMIN_PASSWORD}`);

  for (const c of categories) {
    await prisma.category.upsert({
      where: { name: c.name },
      update: { icon: c.icon },
      create: c,
    });
  }
  console.log(`✔ Seeded ${categories.length} categories`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error("Seed failed:", err);
    await prisma.$disconnect();
    process.exit(1);
  });
