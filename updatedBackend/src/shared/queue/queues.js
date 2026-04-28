import { Queue } from 'bullmq';
import { Redis } from "ioredis";
import { ENV } from '../../lib/env.js';

export const connection = new Redis({
    host: ENV.REDIS_HOST || 'localhost',
    port: ENV.REDIS_PORT || 6379,
    password: ENV.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: null
});


const verificationQueue = new Queue('verificationqueue', { connection });
const welcomeQueue = new Queue('tailorGo-WelcomeMessage', { connection });


export { verificationQueue, welcomeQueue }
