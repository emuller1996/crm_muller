import { Router } from "express";
import * as controller from "./clientes.controllers.js";
import { validateTokenMid } from "../../utils/authjws.js";

const router = Router();

router.get("/", validateTokenMid, controller.getAll);

router.get("/pagination", controller.pagination);

router.get("/:id", controller.getById);

router.post("/", controller.create);

router.put("/:id", controller.update);

router.post("/:id/comments", controller.createComment);

router.get("/:id/comments", controller.getComments);

router.post("/import-excel", controller.importExcel);

export default router;