import { Router } from "express";
import * as controller from "./categorias.controllers.js";
import { checkPermission } from "../../middleware/acl.middleware.js";

const router = Router();

router.get("/", checkPermission("categorias.read"),controller.getAll);
router.post("/", checkPermission("categorias.create"),controller.create);
router.put("/:id", checkPermission("categorias.update"),controller.update);

export default router;
