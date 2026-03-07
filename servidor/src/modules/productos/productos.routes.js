import { Router } from "express";
import * as controller from "./productos.controller.js";
import { validateTokenClientMid } from "../../utils/authjws.js";
import { checkPermission } from "../../middleware/acl.middleware.js";

const router = Router();

router.get("/",checkPermission("productos.read"), controller.getAll);
router.get("/pagination",checkPermission("productos.read"), controller.pagination);
/* router.get("/published", controller.getPublished); */

router.get("/:id",checkPermission("productos.read"), controller.getById);
router.post("/",checkPermission("productos.create"), controller.create);
router.put("/:id",checkPermission("productos.update"), controller.update);
/* 
router.post("/:id/stock", controller.createStock);
router.get("/:id/stock", controller.getStock);
router.get("/:id/stock/logs", controller.getStockLogs);
router.put("/stock/:idStock", controller.updateStock);
router.post("/stock/:idStock/validate", controller.validateStock);

router.post("/:id/images", controller.createImage);
router.get("/:id/images", controller.getImages); */

router.post(
  "/:id/consultas",
  validateTokenClientMid,
  controller.createConsulta
);
router.get("/:id/consultas", controller.getConsultas);

router.post("/import-excel", controller.importExcel);

export default router;