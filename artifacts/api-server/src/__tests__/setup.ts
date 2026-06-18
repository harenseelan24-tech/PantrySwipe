/**
 * Vitest global setup — executed before each test file is imported.
 *
 * Set all required environment variables here so that workspace packages
 * that read process.env at import time see valid values.
 * Never import app modules from this file.
 */

process.env["NODE_ENV"] = "test";

// Database — CI supplies a real Postgres; locally: docker compose up postgres
process.env["DATABASE_URL"] ??=
  "postgresql://test:test@localhost:5432/pantryswipe_test";

// Anthropic integration — lib/integrations-anthropic-ai/src/client.ts checks
// both of these at module load time and throws if either is missing.
// The values below are stubs that satisfy the guard; no real API call is made
// in tests because the routes that use anthropic are not under test here.
process.env["AI_INTEGRATIONS_ANTHROPIC_BASE_URL"] ??=
  "https://api.anthropic.com";
process.env["AI_INTEGRATIONS_ANTHROPIC_API_KEY"] ??=
  "sk-ant-test-placeholder";

// Legacy key (used by some routes directly via process.env)
process.env["ANTHROPIC_API_KEY"] ??= "sk-ant-test-placeholder";
