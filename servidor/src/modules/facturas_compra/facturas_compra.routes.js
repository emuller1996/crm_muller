import { Router } from "express";
import * as controller from "./facturas_compra.controller.js";
import { validateTokenMid } from "../../utils/authjws.js";
import { checkPermission } from "../../middleware/acl.middleware.js";

const router = Router();

router.get("/",checkPermission("facturas_compra.read"), controller.getAll);
router.get("/:id",checkPermission("facturas_compra.read"), controller.getById);
router.get("/per_day/:date",checkPermission("facturas_compra.read"), controller.getPerDay);

router.post("/", checkPermission("facturas_compra.create"), controller.create);
router.put("/:id", checkPermission("facturas_compra.update"), controller.update);

router.patch("/:id/anular", checkPermission("facturas_compra.update"),controller.anularFactura);

router.post("/:id/pagos",checkPermission("facturas_compra.create"), controller.createPago);
router.get("/:id/pagos", checkPermission("facturas_compra.read"),controller.getPagos);

export default router;
