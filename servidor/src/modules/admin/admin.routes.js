import { Router } from "express";
import EmpresasRoutes from "./empresas/empresas.routes.js";
import UsuariosRoutes from "./usuarios/usuarios.routes.js";

const router = Router();

router.use("/empresas", EmpresasRoutes);
router.use("/usuarios", UsuariosRoutes);

export default router;
