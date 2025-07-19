import { Router } from "express";
import {
  buscarElasticByType,
  crearElasticByType,
  getDocumentById,
  updateElasticByType,
} from "../utils/index.js";
import { INDEX_ES_MAIN } from "../config.js";
import { client } from "../db.js";
import { validateTokenMid } from "../utils/authjws.js";

const CategoriasRouters = Router();

CategoriasRouters.get("/", async (req, res) => {
  try {
    var data = await buscarElasticByType("categoria");
    /* return res.json(searchResult.body.hits); */
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/* CategoriasRouters.get("/:id", async (req, res) => {
  try {
    var funcion = await getDocumentById(req.params.id);

    return res.status(200).json(funcion);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}); */

CategoriasRouters.post("/", /* validateTokenMid, */ async (req, res) => {
  try {
    var recinto = {};
    const data = req.body;
    const response = await crearElasticByType(data, "categoria");
    //recinto = response.body;
    return res
      .status(201)
      .json({ message: "Categoria Creada.", recinto, data });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

CategoriasRouters.put("/:id",/* validateTokenMid, */ async (req, res) => {
  try {
    const r = await updateElasticByType(req.params.id, req.body);
    if (r.body.result === "updated") {
      await client.indices.refresh({ index: INDEX_ES_MAIN });
      return res.json({ message: "Categoria Actualizado" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

export default CategoriasRouters;
