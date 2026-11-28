// Helpers para el detalle de pago de las facturas de venta (propiedad nested "detalle_pago").

export const METODOS_PAGO = ["efectivo", "tarjeta", "transferencia"];

const validationError = (message) => {
  const err = new Error(message);
  err.status = 400;
  return err;
};

/**
 * Normaliza el detalle de pago de una factura antes de guardarla.
 * - Mixto: valida >= 2 metodos, valores > 0 y que la suma sea igual al total.
 *   Agrupa las lineas repetidas del mismo metodo.
 * - Otro metodo: arma una sola linea con el total.
 * Lanza un error con status 400 si el detalle no es valido.
 */
export const normalizarDetallePago = (factura) => {
  const total = Math.round(Number(factura.total_monto) || 0);

  if (factura.metodo_pago !== "mixto") {
    return [{ metodo_pago: factura.metodo_pago, valor: total }];
  }

  if (!Array.isArray(factura.detalle_pago)) {
    throw validationError("El pago mixto requiere el detalle de pago");
  }

  const agrupado = {};
  for (const linea of factura.detalle_pago) {
    const metodo = String(linea?.metodo_pago ?? "").toLowerCase();
    const valor = Math.round(Number(linea?.valor) || 0);
    if (!METODOS_PAGO.includes(metodo)) {
      throw validationError(`Metodo de pago no valido en el detalle: "${linea?.metodo_pago}"`);
    }
    if (valor <= 0) {
      throw validationError("Cada metodo del pago mixto debe tener un valor mayor a 0");
    }
    agrupado[metodo] = (agrupado[metodo] || 0) + valor;
  }

  const detalle = Object.entries(agrupado).map(([metodo_pago, valor]) => ({ metodo_pago, valor }));
  if (detalle.length < 2) {
    throw validationError("El pago mixto requiere al menos 2 metodos de pago distintos");
  }

  const suma = detalle.reduce((acc, l) => acc + l.valor, 0);
  if (Math.abs(suma - total) > 1) {
    throw validationError(
      `La suma del pago mixto (${suma}) no coincide con el total de la factura (${total})`,
    );
  }

  return detalle;
};

/**
 * Lineas de pago de una factura: el detalle si existe, o una linea con el total
 * (facturas anteriores al detalle de pago).
 */
export const lineasDePago = (factura) => {
  if (Array.isArray(factura?.detalle_pago) && factura.detalle_pago.length > 0) {
    return factura.detalle_pago.map((l) => ({
      metodo_pago: l.metodo_pago,
      valor: Number(l.valor) || 0,
    }));
  }
  return [
    {
      metodo_pago: factura?.metodo_pago || "efectivo",
      valor: Number(factura?.total_monto) || 0,
    },
  ];
};
