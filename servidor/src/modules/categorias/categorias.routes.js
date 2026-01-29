import { Router } from "express";
import * as controller from "./categorias.controllers.js";

const router = Router();

router.get("/", controller.getAll);
router.post("/", controller.create);
router.put("/:id", controller.update);

export default router;
