import { Router } from "express";
import * as controller from "./clientes.controllers.js";
import { validateTokenMid } from "../../utils/authjws.js";
import { checkPermission } from "../../middleware/acl.middleware.js";

const router = Router();

router.get("/", validateTokenMid,checkPermission("clientes.read"), controller.getAll);

router.get("/pagination",checkPermission("clientes.read"), controller.pagination);

router.get("/:id",checkPermission("clientes.read"), controller.getById);

router.post("/",checkPermission("clientes.create"), controller.create);

router.put("/:id", checkPermission("clientes.update"), controller.update);

router.post("/:id/comments",  checkPermission("clientes.create"), controller.createComment);

router.get("/:id/comments",checkPermission("clientes.read"), controller.getComments);

router.post("/import-excel",checkPermission("clientes.create"), controller.importExcel);

export default router;