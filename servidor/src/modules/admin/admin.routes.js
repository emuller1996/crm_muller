import { Router } from "express";
import AuthRoutes from "./auth/auth.routes.js";
import EmpresasRoutes from "./empresas/empresas.routes.js";
import UsuariosRoutes from "./usuarios/usuarios.routes.js";
import { validateAdminTokenMid } from "./auth/auth.middleware.js";

const router = Router();

// Auth es publico (login, validate)
router.use("/auth", AuthRoutes);

// El resto requiere token de admin
router.use("/empresas", validateAdminTokenMid, EmpresasRoutes);
router.use("/usuarios", validateAdminTokenMid, UsuariosRoutes);

export default router;
