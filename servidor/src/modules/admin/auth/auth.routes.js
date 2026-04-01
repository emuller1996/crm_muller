import { Router } from "express";
import * as controller from "./auth.controller.js";

const router = Router();

router.post("/login", controller.login);
router.get("/validate", controller.validate);

export default router;
