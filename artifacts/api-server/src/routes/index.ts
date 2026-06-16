import { Router, type IRouter } from "express";
import healthRouter from "./health";
import barcodeRouter from "./barcode";

const router: IRouter = Router();

router.use(healthRouter);
router.use(barcodeRouter);

export default router;
