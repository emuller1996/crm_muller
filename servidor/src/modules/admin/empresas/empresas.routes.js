import { Router } from "express";
import * as controller from "./empresas.controller.js";

const router = Router();

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.patch("/:id/disable", controller.disable);
router.patch("/:id/enable", controller.enable);
router.post("/:id/logo", controller.uploadLogo);
router.delete("/:id/logo", controller.deleteLogo);
router.get("/:id/subscription", controller.getSubscription);
router.put("/:id/subscription", controller.updateSubscription);

export default router;
