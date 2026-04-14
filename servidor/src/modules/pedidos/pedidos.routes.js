import { Router } from "express";
import * as controller from "./pedidos.controller.js";
import { checkPermission } from "../../middleware/acl.middleware.js";

const router = Router();

router.get("/", checkPermission("pedidos.read"), controller.getAll);
router.get("/:id", checkPermission("pedidos.read"), controller.getById);
router.post("/", checkPermission("pedidos.create"), controller.create);
router.put("/:id", checkPermission("pedidos.update"), controller.update);

export default router;
