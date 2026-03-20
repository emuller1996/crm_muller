import { Router } from "express";
import * as controller from "./proveedores.controller.js";
import { checkPermission } from "../../middleware/acl.middleware.js";

const router = Router();

router.get("/", checkPermission("proveedores.read"), controller.getAll);

router.get("/pagination", checkPermission("proveedores.read"), controller.pagination);

router.get("/:id", checkPermission("proveedores.read"), controller.getById);

router.post("/", checkPermission("proveedores.create"), controller.create);

router.put("/:id", checkPermission("proveedores.update"), controller.update);

export default router;
