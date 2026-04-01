import { Router } from "express";
import * as controller from "./usuarios.controller.js";

const router = Router();

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.patch("/:id/password", controller.changePassword);
router.patch("/:id/disable", controller.disable);
router.patch("/:id/enable", controller.enable);

export default router;
