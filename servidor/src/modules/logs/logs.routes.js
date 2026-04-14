import { Router } from "express";
import * as controller from "./logs.controller.js";

const router = Router();

router.get("/", controller.pagination);
router.get("/stats", controller.getStats);
router.get("/:id", controller.getById);

export default router;
