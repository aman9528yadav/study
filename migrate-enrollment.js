const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(`ALTER TABLE Enrollment ADD COLUMN status TEXT DEFAULT 'PENDING'`);
  console.log("Migration applied successfully!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
