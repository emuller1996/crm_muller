import { Router } from "express";
import * as controller from "./metrics.controller.js";

const router = Router();

router.get("/kpis", controller.getKPIs);
router.get("/ventas-por-dia", controller.getVentasPorDia);
router.get("/top-productos", controller.getTopProductos);
router.get("/ventas-por-metodo-pago", controller.getVentasPorMetodoPago);
router.get("/top-clientes", controller.getTopClientes);
router.get("/stock-bajo", controller.getStockBajo);
router.get("/caja-hoy", controller.getCajaHoy);

// Metricas detalladas por tab
router.get("/ventas", controller.getMetricasVentas);
router.get("/compras", controller.getMetricasCompras);
router.get("/productos", controller.getMetricasProductos);
router.get("/clientes", controller.getMetricasClientes);
router.get("/proveedores", controller.getMetricasProveedores);

export default router;
