import { ENV } from "../../lib/env.js";

const baseOptions = {
  httpOnly: true
};

export const getAccessTokenOptions = () => ({
  ...baseOptions,
  secure: ENV.NODE_ENV === "production",
  sameSite: ENV.NODE_ENV === "production" ? "Strict" : "Lax",
  expires: new Date(Date.now() + 15 * 60 * 1000)
});

export const getRefreshTokenOptions = () => ({
  ...baseOptions,
  secure: ENV.NODE_ENV === "production",
  sameSite: ENV.NODE_ENV === "production" ? "Strict" : "Lax",
  domain: ENV.NODE_ENV === "production" ? ".deployhub.cloud" : undefined,
  expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
});