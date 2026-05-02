import { Router, type IRouter } from "express";
import healthRouter from "./health";
import contentRouter from "./content";
import calendarRouter from "./calendar";
import categoriesRouter from "./categories";
import analyticsRouter from "./analytics";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/content", contentRouter);
router.use("/calendar", calendarRouter);
router.use("/categories", categoriesRouter);
router.use("/analytics", analyticsRouter);

export default router;
