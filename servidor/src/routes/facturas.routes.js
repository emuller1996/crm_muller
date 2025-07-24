import { response, Router } from "express";
import {
  buscarElasticByType,
  crearElasticByType,
  getDocumentById,
  updateElasticByType,
} from "../utils/index.js";
import { INDEX_ES_MAIN } from "../config.js";
import { client } from "../db.js";
import { validateTokenMid } from "../utils/authjws.js";

const FacturaRouters = Router();

FacturaRouters.get("/", async (req, res) => {
  try {
    var data = await buscarElasticByType("factura");
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

FacturaRouters.post(
  "/",
  /* validateTokenMid, */ async (req, res) => {
    try {
      var recinto = {};
      const data = req.body;
      data.status = "Pendiente";
      const response = await crearElasticByType(data, "factura");
      if (data.cotizacion_id) {
        await updateElasticByType(data.cotizacion_id, {
          factura_id: response.body._id,
        });
      }
      //recinto = response.body;
      return res
        .status(201)
        .json({ message: "Factura Creada.", recinto, data });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
);

FacturaRouters.put(
  "/:id",
  /* validateTokenMid, */ async (req, res) => {
    try {
      const r = await updateElasticByType(req.params.id, req.body);
      if (r.body.result === "updated") {
        await client.indices.refresh({ index: INDEX_ES_MAIN });
        return res.json({ message: "Factura Actualizada" });
      }
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
);

export default FacturaRouters;
