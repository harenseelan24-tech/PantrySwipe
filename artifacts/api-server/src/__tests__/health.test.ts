import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

// ── Module mocks ──────────────────────────────────────────────────────────────
// vi.mock() is hoisted by Vitest above all imports, so these mocks are in place
// before `app` (and therefore every route) is first loaded.
//
// All routes are eagerly imported in routes/index.ts, so every @workspace/*
// package used across ALL routes must be mocked here — otherwise the real
// module loads, new Pool() fires, and the TCP connection to a non-existent
// Postgres hangs the test runner.

vi.mock("@workspace/db", () => ({
  db: {
    execute: vi.fn().mockResolvedValue([{ "?column?": 1 }]),
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          orderBy: vi.fn(() => ({ limit: vi.fn().mockResolvedValue([]) })),
        })),
      })),
    })),
  },
  // Schema tables used in barcode/recipes routes — undefined at import time
  // is fine because those routes only reference them inside async handlers.
  recipes: {},
  productsTable: {},
  insertProductSchema: { parse: vi.fn() },
  pool: { end: vi.fn() },
  sql: vi.fn(),
}));

vi.mock("@workspace/integrations-anthropic-ai", () => ({
  anthropic: {
    messages: {
      create: vi.fn().mockResolvedValue({
        content: [{ type: "text", text: "mock response" }],
      }),
    },
  },
}));

// Import app AFTER the mock declarations so every route gets the mock modules.
import app from "../app.js";
import { db } from "@workspace/db";

beforeEach(() => {
  // Reset the db.execute mock back to "healthy" before each test.
  vi.mocked(db.execute).mockResolvedValue([{ "?column?": 1 }]);
});

// ── /api/healthz/live ────────────────────────────────────────────────────────
describe("GET /api/healthz/live", () => {
  it("responds 200 with status ok", async () => {
    const res = await request(app).get("/api/healthz/live");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  it("includes a numeric uptime field", async () => {
    const res = await request(app).get("/api/healthz/live");
    expect(typeof res.body.uptime).toBe("number");
    expect(res.body.uptime).toBeGreaterThanOrEqual(0);
  });
});

// ── /api/healthz (legacy) ────────────────────────────────────────────────────
describe("GET /api/healthz", () => {
  it("responds 200 with status ok for backward compat", async () => {
    const res = await request(app).get("/api/healthz");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});

// ── /api/healthz/ready ───────────────────────────────────────────────────────
describe("GET /api/healthz/ready", () => {
  it("responds 200 when DB is reachable", async () => {
    const res = await request(app).get("/api/healthz/ready");
    expect(res.status).toBe(200);
    expect(res.body.checks.db).toBe("pass");
  });

  it("responds 503 when DB is unreachable", async () => {
    vi.mocked(db.execute).mockRejectedValueOnce(
      new Error("Connection refused")
    );
    const res = await request(app).get("/api/healthz/ready");
    expect(res.status).toBe(503);
    expect(res.body.checks.db).toBe("fail");
  });
});

// ── 404 handler ──────────────────────────────────────────────────────────────
describe("Unknown routes", () => {
  it("returns 404 for unregistered paths", async () => {
    const res = await request(app).get("/api/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Not found");
  });
});
