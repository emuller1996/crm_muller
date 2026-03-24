import { Router } from "express";
import * as controller from "./caja.controller.js";
import { checkPermission } from "../../middleware/acl.middleware.js";

const router = Router();

router.get("/", checkPermission("caja.read"), controller.getAll);

router.get("/pagination", checkPermission("caja.read"), controller.pagination);

router.get("/resumen/:fecha", checkPermission("caja.read"), controller.getResumenDia);

router.get("/resumen-rango", checkPermission("caja.read"), controller.getResumenRango);

router.get("/:id", checkPermission("caja.read"), controller.getById);

router.post("/", checkPermission("caja.create"), controller.create);

router.put("/:id", checkPermission("caja.update"), controller.update);

router.patch("/:id/anular", checkPermission("caja.update"), controller.anular);

export default router;
