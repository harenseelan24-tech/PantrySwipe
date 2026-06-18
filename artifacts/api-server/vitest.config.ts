import { defineConfig } from "vitest/config";
import { fileURLToPath } from "url";
import { resolve } from "path";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  // Map @workspace/* specifiers to their real source files so vi.mock() can
  // intercept them by the same resolved path that Node/Vitest would load.
  // Without this, pnpm symlinks in node_modules/@workspace/<pkg> resolve to a
  // different absolute path than the @workspace/<pkg> specifier, causing
  // vi.mock("@workspace/db") to never fire and the real Pool to connect.
  resolve: {
    alias: {
      "@workspace/db": resolve(__dirname, "../../lib/db/src/index.ts"),
      "@workspace/api-zod": resolve(
        __dirname,
        "../../lib/api-zod/src/index.ts"
      ),
      "@workspace/integrations-anthropic-ai": resolve(
        __dirname,
        "../../lib/integrations-anthropic-ai/src/index.ts"
      ),
    },
  },

  test: {
    environment: "node",

    // Runs before each test file — sets env vars before any app module loads.
    setupFiles: ["./src/__tests__/setup.ts"],

    include: ["src/**/*.test.ts"],

    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      // Thresholds reflect current baseline (health-endpoint tests only).
      // Raise these as the test suite grows to cover more routes.
      thresholds: {
        lines: 20,
        functions: 15,
        statements: 20,
        branches: 3,
      },
      exclude: [
        "src/__tests__/**",
        "src/index.ts", // entrypoint — tested via smoke test, not unit tests
      ],
    },
  },
});
