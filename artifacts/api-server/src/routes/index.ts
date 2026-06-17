import { Router, type IRouter } from "express";
import healthRouter from "./health";
import barcodeRouter from "./barcode";
import visionRouter from "./vision";
import recipesRouter from "./recipes";

const router: IRouter = Router();

router.use(healthRouter);
router.use(barcodeRouter);
router.use(visionRouter);
router.use(recipesRouter);

export default router;
