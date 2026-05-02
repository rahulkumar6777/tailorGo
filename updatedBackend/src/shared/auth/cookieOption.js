import { ENV } from "../../lib/env.js";

const baseOptions = {
  httpOnly: true
};

// Access Token Cookie Options
export const getAccessTokenOptions = () => ({
  ...baseOptions,
  secure: ENV.NODE_ENV === "production",
  sameSite: ENV.NODE_ENV === "production" ? "Strict" : "Lax",
  domain: ENV.NODE_ENV === "production" ? "tailorgo.in" : undefined,
  expires: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
});

// Refresh Token Cookie Options
export const getRefreshTokenOptions = () => ({
  ...baseOptions,
  secure: ENV.NODE_ENV === "production",
  sameSite: ENV.NODE_ENV === "production" ? "Strict" : "Lax",
  domain: ENV.NODE_ENV === "production" ? "tailorgo.in" : undefined,
  expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
});

// Clear Access Token Cookie Options
export const getClearAccessTokenOptions = () => ({
  ...baseOptions,
  secure: ENV.NODE_ENV === "production",
  sameSite: ENV.NODE_ENV === "production" ? "Strict" : "Lax",
  domain: ENV.NODE_ENV === "production" ? "tailorgo.in" : undefined
});

// Clear Refresh Token Cookie Options
export const getClearRefreshTokenOptions = () => ({
  ...baseOptions,
  secure: ENV.NODE_ENV === "production",
  sameSite: ENV.NODE_ENV === "production" ? "Strict" : "Lax",
  domain: ENV.NODE_ENV === "production" ? "tailorgo.in" : undefined
});