import { Router } from "express";
import { client } from "../db.js";

import UsuariosRouters from "./usuarios.routes.js";
import AuthRouters from "./auth.routes.js";
import CategoriasRouters from "../modules/categorias/categorias.routes.js";
import ProductosRouters from "../modules/productos/productos.routes.js";
import { validateTokenMid } from "../utils/authjws.js";
import { INDEX_ES_MAIN_LOGS } from "../config.js";
import ConsultasRouters from "./consultas.routes.js";
import OrdenesRouters from "./ordenes.routes.js";
import PuntoVentaRouters from "./punto_venta.routes.js";
import PagosRouters from "./pagos.routes.js";
import CotizacionRouters from "./cotizacion.routes.js";
import FacturaRouters from "./facturas.routes.js";
import PedidosRouters from "./pedidos.routes.js";
import EmpresaRouters from "./empresa.routes.js";
import ClienteRouters from "../modules/clientes/clientes.routes.js";

// Importar todos los routers;
// Ejemplo: const authRouter = require('./auth.js');

const router = Router();

// Configurar los routers
// Ejemplo: router.use('/auth', authRouter);

router.use("/usuarios", validateTokenMid, UsuariosRouters);
router.use("/consultas", ConsultasRouters);
router.use("/categoria",validateTokenMid, CategoriasRouters);
router.use("/productos", ProductosRouters);
router.use("/clientes/",validateTokenMid, ClienteRouters);
router.use("/auth", AuthRouters);
router.use("/punto_venta", PuntoVentaRouters);
router.use("/pagos", PagosRouters);
router.use("/cotizacion", validateTokenMid,  CotizacionRouters);
router.use("/pedidos", validateTokenMid,  PedidosRouters);
router.use("/factura", validateTokenMid, FacturaRouters);
router.use("/empresa", validateTokenMid, EmpresaRouters);


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
