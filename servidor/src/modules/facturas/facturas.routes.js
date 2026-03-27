import { Router } from "express";
import * as controller from "./facturas.controller.js";
import { validateTokenMid } from "../../utils/authjws.js";
import { checkPermission } from "../../middleware/acl.middleware.js";

const router = Router();

router.get("/", checkPermission("facturas.read"),controller.getAll);
router.get("/:id", checkPermission("facturas.read"),controller.getById);
router.get("/per_day/:date",checkPermission("facturas.read"), controller.getPerDay);

router.post("/", checkPermission("facturas.create"), controller.create);
router.put("/:id", checkPermission("facturas.update"), controller.update);

router.patch("/:id/anular", checkPermission("facturas.update"), controller.anularFactura);

router.post("/:id/pagos",checkPermission("facturas.create"), controller.createPago);
router.get("/:id/pagos",checkPermission("facturas.read"), controller.getPagos);

export default router;