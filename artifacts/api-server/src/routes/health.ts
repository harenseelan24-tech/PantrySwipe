import { Router, type IRouter, type Request, type Response } from "express";
import { sql } from "drizzle-orm";
import { db } from "@workspace/db";
import { HealthCheckResponse } from "@workspace/api-zod";

const router: IRouter = Router();
const startedAt = Date.now();

/**
 * Liveness — "is the process alive?"
 *
 * Orchestrators (Kubernetes, ECS) hit this to decide whether to RESTART
 * the container. Must be cheap: no external I/O, no DB call.
 * If you add a DB call here, a slow database will trigger unnecessary restarts.
 */
router.get("/healthz/live", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    uptime: Math.floor((Date.now() - startedAt) / 1000),
  });
});

/**
 * Readiness — "can this instance serve traffic?"
 *
 * Load balancers and service meshes hit this to decide whether to ROUTE
 * traffic here. A 503 removes the pod from rotation without restarting it —
 * correct behaviour when the DB is temporarily unreachable.
 */
router.get("/healthz/ready", async (_req: Request, res: Response) => {
  try {
    await db.execute(sql`SELECT 1`);
    res.json({ status: "ok", checks: { db: "pass" } });
  } catch {
    res.status(503).json({ status: "degraded", checks: { db: "fail" } });
  }
});

/**
 * Legacy path — preserved for backward compatibility with existing probes.
 * New code should prefer /healthz/live or /healthz/ready.
 */
router.get("/healthz", (_req: Request, res: Response) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

export default router;
