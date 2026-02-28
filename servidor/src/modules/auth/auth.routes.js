import { Router } from "express";
import * as controller from "./auth.controller.js";
import { validateToken } from "../../utils/authjws.js";

const router = Router();

router.get("/validate", validateToken);
router.post("/login", controller.login);

export default router;