import { Router } from "express";
import * as controller from "./cotizaciones.controller.js";
import { validateTokenMid } from "../../utils/authjws.js";

const router = Router();

router.get("/", controller.getAll);
router.post("/", validateTokenMid, controller.create);
router.put("/:id", validateTokenMid, controller.update);

export default router;