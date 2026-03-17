import { Router } from "express";
import * as controller from "./usuarios.controller.js";
import { checkPermission } from "../../middleware/acl.middleware.js";

const router = Router();

router.get("/", checkPermission("usuarios.read"), controller.getAll);
router.get("/:id", checkPermission("usuarios.read"), controller.getById);
router.post("/", checkPermission("usuarios.create"), controller.create);
router.patch("/:id", checkPermission("usuarios.update"), controller.update);
router.patch("/:id/change_password", checkPermission("usuarios.update"), controller.changePassword);

export default router;
