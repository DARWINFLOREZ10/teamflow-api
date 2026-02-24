import dotenv from 'dotenv';

dotenv.config();

function getEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: getEnv('NODE_ENV', 'development'),
  port: Number(getEnv('PORT', '4000')),
  databaseUrl: getEnv('DATABASE_URL'),
  jwtAccessSecret: getEnv('JWT_ACCESS_SECRET'),
  jwtRefreshSecret: getEnv('JWT_REFRESH_SECRET'),
  jwtAccessExpiresIn: getEnv('JWT_ACCESS_EXPIRES_IN', '15m'),
  jwtRefreshExpiresIn: getEnv('JWT_REFRESH_EXPIRES_IN', '7d'),
  redisUrl: getEnv('REDIS_URL')
};
