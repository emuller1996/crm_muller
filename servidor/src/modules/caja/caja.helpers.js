import { getDocumentById } from "../../utils/index.js";

export const buildMovimiento = async (movimiento) => {
  if (movimiento.user_create_id) {
    const user = await getDocumentById(movimiento.user_create_id);
    movimiento.user_create = { name: user?.name ?? null };
    delete movimiento.user_create_id;
  }
  return movimiento;
};
