import { Router } from "express";
import * as controller from "./roles.controllers.js";
import { checkPermission } from "../../middleware/acl.middleware.js";

const router = Router();

router.get("/", checkPermission("usuarios.read"),controller.getAll);
router.post("/",checkPermission("usuarios.create"), controller.create);
router.put("/:id",checkPermission("usuarios.update"), controller.update);

export default router;
