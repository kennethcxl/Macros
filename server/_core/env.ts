const getEnv = (key: string, defaultValue = ""): string => {
  const value = process.env[key];
  if (!value && !defaultValue && (process.env.NODE_ENV === "production" || process.env.VERCEL)) {
    console.warn(`[Config] Warning: Environment variable ${key} is missing`);
  }
  return value ?? defaultValue;
};

export const ENV = {
  // Supabase
  supabaseUrl: getEnv("VITE_SUPABASE_URL"),
  supabaseAnonKey: getEnv("VITE_SUPABASE_ANON_KEY"),
  supabaseServiceKey: getEnv("SUPABASE_SERVICE_KEY"),

  // Database
  databaseUrl: getEnv("DATABASE_URL"),

  // JWT
  cookieSecret: getEnv("JWT_SECRET", "dev-secret-do-not-use-in-prod"),

  // Environment
  isProduction: process.env.NODE_ENV === "production" || !!process.env.VERCEL,

  // Optional APIs
  forgeApiUrl: getEnv("BUILT_IN_FORGE_API_URL"),
  forgeApiKey: getEnv("BUILT_IN_FORGE_API_KEY"),
  openRouterApiKey: getEnv("OPENROUTER_API_KEY"),
};
