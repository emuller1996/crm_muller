import { getDocumentById } from "../../utils/index.js";

export const buildCotizacion = async (cotizacion) => {
  try {
    if (cotizacion.client_id) {
      cotizacion.client =
        (await getDocumentById(cotizacion.client_id)) ?? null;
    }

    if (cotizacion.user_create_id) {
      const user = await getDocumentById(
        cotizacion.user_create_id
      );

      cotizacion.user_create = {
        name: user?.name ?? null,
      };
    }

    delete cotizacion.user_create_id;
  } catch (error) {
    console.log(error);
  }

  return cotizacion;
};