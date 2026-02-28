import { getDocumentById } from "../../utils/index.js";

export const buildFactura = async (factura) => {
  try {
    if (factura.client_id) {
      factura.client =
        await getDocumentById(factura.client_id);
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

export const buildPagoFactura = async (pago) => {
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