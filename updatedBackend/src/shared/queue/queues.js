import { Queue } from 'bullmq';

const verificationQueue = new Queue('verificationqueue');

export { verificationQueue }