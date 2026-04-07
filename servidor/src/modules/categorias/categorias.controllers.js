import { SECRECT_CLIENT } from "../../config.js";
import * as service from "./categorias.services.js";
import jsonwebtoken from "jsonwebtoken";


export const getAll = async (req, res) => {
  try {
    const token = req.headers["access-token"]
    const decoded = jsonwebtoken.verify(token, SECRECT_CLIENT)
    const data = await service.getAll(decoded.empresa_id);
    res.json(data);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const create = async (req, res) => {
  try {
    let data = req.body;
    const token = req.headers["access-token"]
    const decoded = jsonwebtoken.verify(token, SECRECT_CLIENT)
    data.empresa_id = decoded.empresa_id
    const result = await service.create(data);
    return res
      .status(201)
      .json({ message: "Categoría creada correctamente", result });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const update = async (req, res) => {
  try {
    let data = req.body;
    const result = await service.update(data,req.params.id)
    return res.status(202).json({message:"Categoría actualizada correctamente", result:result.body})
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
