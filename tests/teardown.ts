export default async function teardown() {
  try {
    const { redis } = await import('../src/config/redis');
    await redis.quit();
  } catch {
    // Ignore if already closed
  }

  try {
    const { prisma } = await import('../src/config/prisma');
    await prisma.$disconnect();
  } catch {
    // Ignore if already disconnected
  }
}
