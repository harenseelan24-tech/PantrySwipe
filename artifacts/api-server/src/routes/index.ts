import { Router, type IRouter } from "express";
import healthRouter from "./health";
import barcodeRouter from "./barcode";
import visionRouter from "./vision";

const router: IRouter = Router();

router.use(healthRouter);
router.use(barcodeRouter);
router.use(visionRouter);

export default router;
