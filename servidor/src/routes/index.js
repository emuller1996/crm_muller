import { Router } from "express";
import { client } from "../db.js";

import UsuariosRouters from "../modules/usuarios/usuarios.routes.js";
import AuthRouters from "../modules/auth/auth.routes.js";
import CategoriasRouters from "../modules/categorias/categorias.routes.js";
import ProductosRouters from "../modules/productos/productos.routes.js";
import { validateTokenMid } from "../utils/authjws.js";
import { INDEX_ES_MAIN_LOGS } from "../config.js";
import PuntoVentaRouters from "./punto_venta.routes.js";
import PagosRouters from "./pagos.routes.js";
import PedidosRouters from "./pedidos.routes.js";
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


const router = Router();

router.use("/usuarios", validateTokenMid, UsuariosRouters);
router.use("/roles", validateTokenMid,RolesRouers );
router.use("/categoria",validateTokenMid, CategoriasRouters);
router.use("/productos",validateTokenMid, ProductosRouters);
router.use("/clientes/",validateTokenMid, ClienteRouters);
router.use("/auth", AuthRouters);
router.use("/punto_venta", PuntoVentaRouters);
router.use("/pagos", PagosRouters);
router.use("/cotizacion", validateTokenMid,  CotizacionRouters);
router.use("/pedidos", validateTokenMid,  PedidosRouters);
router.use("/factura", validateTokenMid, FacturaRouters);
router.use("/empresa", validateTokenMid, EmpresaRouters);
router.use("/actividades", validateTokenMid, ActividadesRouters);
router.use("/proveedores", validateTokenMid, ProveedoresRouters);
router.use("/caja", validateTokenMid, CajaRouters);
router.use("/factura-compra", validateTokenMid, FacturaCompraRouters);
router.use("/inventario", validateTokenMid, InventarioRouters);
router.use("/admin", AdminRouters);


router.get("/logs", async (req, res) => {
  try {
    const searchResult = await client.search({
      index: INDEX_ES_MAIN_LOGS,
      size: 100,
      body: {
        sort: [
          { createdTime: { order: "desc" } }, // Reemplaza con el campo por el que quieres ordenar
        ],
      },
    });
    return res.json(searchResult.body.hits.hits);
  } catch (error) {
    console.log(error);
    return res.json({ error: error.message });
  }
});
export default router;
