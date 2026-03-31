import { Router } from "express";
import * as controller from "./inventario.controller.js";
import { checkPermission } from "../../middleware/acl.middleware.js";

const router = Router();

router.get("/resumen", checkPermission("inventario.read"), controller.getResumenInventario);
router.get("/movimientos", checkPermission("inventario.read"), controller.getMovimientos);
router.get("/producto/:id/stock", checkPermission("inventario.read"), controller.getStockByProducto);
router.get("/producto/:id/movimientos", checkPermission("inventario.read"), controller.getMovimientosByProducto);
router.post("/movimiento", checkPermission("inventario.create"), controller.registrarMovimientoManual);
router.patch("/movimiento/:id/anular", checkPermission("inventario.update"), controller.anularMovimiento);

export default router;
