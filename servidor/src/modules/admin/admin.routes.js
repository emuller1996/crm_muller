import { Router } from "express";
import EmpresasRoutes from "./empresas/empresas.routes.js";

const router = Router();

router.use("/empresas", EmpresasRoutes);

export default router;
