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

const CotizacionRouters = Router();

CotizacionRouters.get("/", async (req, res) => {
  try {
    var data = await buscarElasticByType("cotizacion");
    data = data.map(async (c) => {
      if (c.client_id && c.client_id !== "") {
        try {
          const clientdata = await getDocumentById(c.client_id);
          return {
            ...c,
            client: clientdata,
          };
        } catch (error) {
          return c;
        }
      } else {
        return c;
      }
    });
    data = await Promise.all(data);
    /* return res.json(searchResult.body.hits); */
    return res.status(200).json(data);
    /* return res.json(searchResult.body.hits); */
    //return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/* CotizacionRouters.get("/:id", async (req, res) => {
  try {
    var funcion = await getDocumentById(req.params.id);

    return res.status(200).json(funcion);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}); */

CotizacionRouters.post(
  "/",
  /* validateTokenMid, */ async (req, res) => {
    try {
      var recinto = {};
      const data = req.body;
      data.status = "Pendiente";
      const response = await crearElasticByType(data, "cotizacion");
      //recinto = response.body;
      return res
        .status(201)
        .json({ message: "Categoria Creada.", recinto, data });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
);

CotizacionRouters.put(
  "/:id",
  /* validateTokenMid, */ async (req, res) => {
    try {
      const r = await updateElasticByType(req.params.id, req.body);
      if (r.body.result === "updated") {
        await client.indices.refresh({ index: INDEX_ES_MAIN });
        return res.json({ message: "Categoria Actualizado" });
      }
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
);

export default CotizacionRouters;
