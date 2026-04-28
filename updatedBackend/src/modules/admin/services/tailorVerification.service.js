import crypto from 'crypto';
import { ENV } from '../../../lib/env.js';
import { model } from '../../../models/index.js';
import { connection } from '../../../shared/queue/queues.js';

const TOKEN_TTL_SECONDS = 10 * 60;
const TOKEN_PREFIX = 'tailor-admin-verification:';

const hashToken = (token) => crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

const getApiPublicUrl = () => {
    const fallbackUrl = `http://localhost:${ENV.PORT || 5000}/api`;
    return (ENV.API_PUBLIC_URL || fallbackUrl).replace(/\/$/, '');
}

export const createTailorAdminVerificationLink = async (tailorId) => {
    if (!tailorId) {
        throw new Error('tailorId is required');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(token);

    await connection.setex(
        `${TOKEN_PREFIX}${tokenHash}`,
        TOKEN_TTL_SECONDS,
        String(tailorId)
    );

    return `${getApiPublicUrl()}/v1/admin/tailor/verify/${token}`;
}

export const verifyTailorByAdminToken = async (token) => {
    if (!token) {
        throw new Error('Verification token is required');
    }

    const tokenKey = `${TOKEN_PREFIX}${hashToken(token)}`;
    const tailorId = await connection.eval(
        `
        local value = redis.call("GET", KEYS[1])
        if value then
            redis.call("DEL", KEYS[1])
        end
        return value
        `,
        1,
        tokenKey
    );

    if (!tailorId) {
        throw new Error('Verification link is invalid, expired, or already used');
    }

    const tailor = await model.Tailor.findById(tailorId);
    if (!tailor) {
        throw new Error('Tailor not found');
    }

    tailor.status = 'active';
    tailor.verificationStatus = 'verified';
    await tailor.save();

    return tailor;
}

export const ADMIN_VERIFICATION_LINK_EXPIRY_MINUTES = TOKEN_TTL_SECONDS / 60;
