// lib/config.ts
export const config = {
  apiUrl: process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.xleos.com",
  frontendUrl: process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000",
  environment: process.env.NODE_ENV || "development",
};

export default config;
