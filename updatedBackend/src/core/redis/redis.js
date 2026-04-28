import Redis from 'ioredis';
import { ENV } from '../../lib/env.js';

export const redisClient = new Redis({
  host: ENV.REDIS_HOST,
  port: ENV.REDIS_PORT,
  password: ENV.REDIS_PASSWORD,
});

redisClient.on('connect', () => {
  console.log('Redis connected successfully');
});

redisClient.on('error', (err) => {
  console.log('Redis connection error:' , err);
});