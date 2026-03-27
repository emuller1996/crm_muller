import { getDocumentById } from "../../utils/index.js";

export const buildFacturaCompra = async (factura) => {
  try {
    if (factura.proveedor_id) {
      factura.proveedor =
        await getDocumentById(factura.proveedor_id);
    }

    if (factura.user_create_id) {
      const user = await getDocumentById(
        factura.user_create_id
      );

      factura.user_create = {
        name: user?.name ?? null,
      };
    }

    delete factura.user_create_id;
  } catch (error) {
    console.log(error);
  }

  return factura;
};

export const buildPagoFacturaCompra = async (pago) => {
  try {
    if (pago.user_create_id) {
      const user = await getDocumentById(
        pago.user_create_id
      );

      pago.user_create = {
        name: user?.name ?? null,
      };
    }

    delete pago.user_create_id;
  } catch (error) {
    console.log(error);
  }

  return pago;
};
