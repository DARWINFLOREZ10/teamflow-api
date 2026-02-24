import { app } from './app';
import { env } from './config/env';
import { ensureRedisConnection } from './config/redis';

async function bootstrap() {
  await ensureRedisConnection();

  app.listen(env.port, () => {
    console.log(`API running on port ${env.port}`);
  });
}

bootstrap().catch((error) => {
  console.error('Bootstrap error:', error);
  process.exit(1);
});
