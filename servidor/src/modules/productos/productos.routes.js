import { Router } from "express";
import * as controller from "./productos.controller.js";
import { validateTokenClientMid } from "../../utils/authjws.js";

const router = Router();

router.get("/", controller.getAll);
router.get("/pagination", controller.pagination);
router.get("/published", controller.getPublished);

router.get("/:id", controller.getById);
router.post("/", controller.create);
router.put("/:id", controller.update);

router.post("/:id/stock", controller.createStock);
router.get("/:id/stock", controller.getStock);
router.get("/:id/stock/logs", controller.getStockLogs);
router.put("/stock/:idStock", controller.updateStock);
router.post("/stock/:idStock/validate", controller.validateStock);

router.post("/:id/images", controller.createImage);
router.get("/:id/images", controller.getImages);

router.post(
  "/:id/consultas",
  validateTokenClientMid,
  controller.createConsulta
);
router.get("/:id/consultas", controller.getConsultas);

router.post("/import-excel", controller.importExcel);

export default router;