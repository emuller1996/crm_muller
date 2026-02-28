import { Router } from "express";
import * as controller from "./facturas.controller.js";
import { validateTokenMid } from "../../utils/authjws.js";

const router = Router();

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.get("/per_day/:date", controller.getPerDay);

router.post("/", validateTokenMid, controller.create);
router.put("/:id", validateTokenMid, controller.update);

router.post("/:id/pagos", controller.createPago);
router.get("/:id/pagos", controller.getPagos);

export default router;