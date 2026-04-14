import { Router } from "express";

import UsuariosRouters from "../modules/usuarios/usuarios.routes.js";
import AuthRouters from "../modules/auth/auth.routes.js";
import CategoriasRouters from "../modules/categorias/categorias.routes.js";
import ProductosRouters from "../modules/productos/productos.routes.js";
import { validateTokenMid } from "../utils/authjws.js";
import PedidosRouters from "../modules/pedidos/pedidos.routes.js";
import EmpresaRouters from "./empresa.routes.js";
import AdminRouters from "../modules/admin/admin.routes.js";
import ClienteRouters from "../modules/clientes/clientes.routes.js";
import CotizacionRouters from "../modules/cotizaciones/cotizaciones.routes.js";
import FacturaRouters from "../modules/facturas/facturas.routes.js";
import RolesRouers from "../modules/roles/roles.routes.js";
import ActividadesRouters from "../modules/actividades/actividades.routes.js";
import ProveedoresRouters from "../modules/proveedores/proveedores.routes.js";
import CajaRouters from "../modules/caja/caja.routes.js";
import FacturaCompraRouters from "../modules/facturas_compra/facturas_compra.routes.js";
import InventarioRouters from "../modules/inventario/inventario.routes.js";
import MetricsRouters from "../modules/metrics/metrics.routes.js";
import LogsRouters from "../modules/logs/logs.routes.js";


const router = Router();

router.use("/usuarios", validateTokenMid, UsuariosRouters);
router.use("/roles", validateTokenMid,RolesRouers );
router.use("/categoria",validateTokenMid, CategoriasRouters);
router.use("/productos",validateTokenMid, ProductosRouters);
router.use("/clientes/",validateTokenMid, ClienteRouters);
router.use("/auth", AuthRouters);
router.use("/cotizacion", validateTokenMid,  CotizacionRouters);
router.use("/pedidos", validateTokenMid,  PedidosRouters);
router.use("/factura", validateTokenMid, FacturaRouters);
router.use("/empresa", validateTokenMid, EmpresaRouters);
router.use("/actividades", validateTokenMid, ActividadesRouters);
router.use("/proveedores", validateTokenMid, ProveedoresRouters);
router.use("/caja", validateTokenMid, CajaRouters);
router.use("/factura-compra", validateTokenMid, FacturaCompraRouters);
router.use("/inventario", validateTokenMid, InventarioRouters);
router.use("/metrics", validateTokenMid, MetricsRouters);
router.use("/admin", AdminRouters);
router.use("/logs", validateTokenMid, LogsRouters);

export default router;
