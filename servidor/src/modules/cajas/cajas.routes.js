import { Router } from "express";
import * as controller from "./cajas.controller.js";
import { checkPermission } from "../../middleware/acl.middleware.js";

const router = Router();

router.get("/", checkPermission("cajas.read"), controller.getAll);

router.get("/pagination", checkPermission("cajas.read"), controller.pagination);

router.get("/:id", checkPermission("cajas.read"), controller.getById);

router.post("/", checkPermission("cajas.create"), controller.create);

router.put("/:id", checkPermission("cajas.update"), controller.update);

export default router;
