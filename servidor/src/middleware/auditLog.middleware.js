import { client } from "../db.js";
import { INDEX_ES_MAIN_LOGS } from "../config.js";

/**
 * Mapeo de rutas a nombres de modulo legibles
 */
const MODULE_MAP = {
  "/usuarios": "Usuarios",
  "/roles": "Roles",
  "/categoria": "Categorias",
  "/productos": "Productos",
  "/clientes": "Clientes",
  "/cotizacion": "Cotizaciones",
  "/pedidos": "Pedidos",
  "/factura": "Facturas",
  "/factura-compra": "Facturas Compra",
  "/empresa": "Empresa",
  "/actividades": "Actividades",
  "/proveedores": "Proveedores",
  "/caja": "Caja",
  "/inventario": "Inventario",
};

const ACTION_MAP = {
  POST: "crear",
  PUT: "actualizar",
  PATCH: "modificar",
  DELETE: "eliminar",
};

/**
 * Extrae el modulo desde la URL base
 */
const getModuleName = (originalUrl) => {
  const parts = originalUrl.split("/").filter(Boolean);
  const base = `/${parts[0]}`;
  return MODULE_MAP[base] || parts[0] || "Desconocido";
};

/**
 * Genera una descripcion legible de la accion
 */
const buildDescription = (method, originalUrl, moduleName) => {
  const action = ACTION_MAP[method] || method;
  const parts = originalUrl.split("/").filter(Boolean);

  // Detectar sub-acciones especiales
  if (originalUrl.includes("/anular")) return `Anular registro en ${moduleName}`;
  if (originalUrl.includes("/disable")) return `Deshabilitar registro en ${moduleName}`;
  if (originalUrl.includes("/enable")) return `Habilitar registro en ${moduleName}`;
  if (originalUrl.includes("/password")) return `Cambiar contrasena en ${moduleName}`;
  if (originalUrl.includes("/logo")) return method === "DELETE" ? `Eliminar logo en ${moduleName}` : `Subir logo en ${moduleName}`;
  if (originalUrl.includes("/import-excel")) return `Importar Excel en ${moduleName}`;
  if (originalUrl.includes("/pagos")) return `Registrar pago en ${moduleName}`;
  if (originalUrl.includes("/comments")) return `Agregar comentario en ${moduleName}`;
  if (originalUrl.includes("/stock")) return `Movimiento de stock en ${moduleName}`;
  if (originalUrl.includes("/movimiento")) return `Registrar movimiento en ${moduleName}`;

  return `${action.charAt(0).toUpperCase() + action.slice(1)} en ${moduleName}`;
};

/**
 * Sanitiza el body para no guardar datos sensibles
 */
const sanitizeBody = (body) => {
  if (!body || typeof body !== "object") return null;

  const sanitized = { ...body };
  const sensitiveKeys = ["password", "contrasena", "token", "secret", "signature"];

  for (const key of sensitiveKeys) {
    if (sanitized[key]) {
      sanitized[key] = "***";
    }
  }

  // Limitar tamano del body para no saturar el log
  const str = JSON.stringify(sanitized);
  if (str.length > 5000) {
    return { _truncated: true, _size: str.length, _keys: Object.keys(sanitized) };
  }

  return sanitized;
};

/**
 * Middleware de audit log.
 * Intercepta POST, PUT, PATCH, DELETE y registra en crm_muller_logs.
 */
export const auditLogMiddleware = (req, res, next) => {
  const method = req.method;

  // Solo loguear operaciones de escritura
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    return next();
  }

  // Ignorar rutas de auth (login/validate) y logs
  if (req.originalUrl.includes("/auth/") || req.originalUrl.includes("/logs")) {
    return next();
  }

  // Capturar la respuesta original
  const originalJson = res.json.bind(res);
  const startTime = Date.now();

  res.json = function (data) {
    const duration = Date.now() - startTime;
    const moduleName = getModuleName(req.originalUrl);

    const logEntry = {
      // Identificacion
      type: "audit_log",
      empresa_id: req.empresaId || null,

      // Request
      method,
      url: req.originalUrl,
      modulo: moduleName,
      accion: ACTION_MAP[method] || method,
      descripcion: buildDescription(method, req.originalUrl, moduleName),

      // Datos
      request_body: sanitizeBody(req.body),
      params: req.params && Object.keys(req.params).length > 0 ? req.params : null,
      query: req.query && Object.keys(req.query).length > 0 ? req.query : null,

      // Respuesta
      status_code: res.statusCode,
      response_message: data?.message || null,
      success: res.statusCode >= 200 && res.statusCode < 400,

      // Usuario
      user_id: req.user?._id || null,
      user_name: req.user?.name || null,
      user_email: req.user?.email || null,

      // Meta
      ip: req.ip || req.headers["x-forwarded-for"] || null,
      user_agent: req.headers["user-agent"] || null,
      duration_ms: duration,
      timestamp: new Date().toISOString(),
      createdTime: Date.now(),
    };

    // Guardar log de forma asincrona sin bloquear la respuesta
    client
      .index({
        index: INDEX_ES_MAIN_LOGS,
        body: logEntry,
      })
      .catch((err) => console.log("Error guardando audit log:", err.message));

    return originalJson(data);
  };

  next();
};
