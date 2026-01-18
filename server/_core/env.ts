export const ENV = {
  // Supabase
  supabaseUrl: process.env.VITE_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY ?? "",
  supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY ?? "",

  // Database
  databaseUrl: process.env.DATABASE_URL ?? "",

  // JWT
  cookieSecret: process.env.JWT_SECRET ?? "",

  // Environment
  isProduction: process.env.NODE_ENV === "production",

  // Optional APIs
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  openRouterApiKey: process.env.OPENROUTER_API_KEY ?? "",
};
