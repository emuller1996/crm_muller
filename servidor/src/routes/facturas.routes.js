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
import { jwtDecode } from "jwt-decode";

const FacturaRouters = Router();

FacturaRouters.get("/", async (req, res) => {
  try {
    var data = await buscarElasticByType("factura");
    data = data.map(async (c) => {
      try {
        if (c.client_id && c.client_id !== "") {
          const clientdata = await getDocumentById(c.client_id);
          c.client = clientdata ?? null;
        }
        if (c.user_create_id && c.user_create_id !== "") {
          const user_create_data = await getDocumentById(c.user_create_id);
          c.user_create = { name: user_create_data?.name ?? null };
        }
        delete c.user_create_id;
      } catch (error) {
        console.log(error);
      }
      return c;
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

FacturaRouters.get("/:id", async (req, res) => {
  try {
    var funcion = await getDocumentById(req.params.id);
    return res.status(200).json(funcion);
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
      if (!data.status) {
        data.status = "Pendiente";
      }
      data.user_create_id = jwtDecode(req.headers[`access-token`])?._id;
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

FacturaRouters.post("/:id/pagos", async (req, res) => {
  try {
    var data = req.body;
    data.user_create_id = jwtDecode(req.headers[`access-token`])?._id;
    data.factura_id = req.params.id;
    await crearElasticByType(data, "pago_factura");
    return res
      .status(201)
      .json({ message: "Pago de la Factura Creada con Exito." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
});

FacturaRouters.get(
  "/:id/pagos",
  /* validateTokenMid,  */ async (req, res) => {
    try {
      const searchResult = await client.search({
        index: INDEX_ES_MAIN,
        size: 1000,
        body: {
          query: {
            bool: {
              must: [
                {
                  term: {
                    "type.keyword": {
                      value: "pago_factura",
                    },
                  },
                },
                {
                  term: {
                    "factura_id.keyword": {
                      value: req.params.id,
                    },
                  },
                },
              ],
            },
          },
          sort: [
            { createdTime: { order: "desc" } }, // Reemplaza con el campo por el que quieres ordenar
          ],
        },
      });

      var data = searchResult.body.hits.hits.map((c) => {
        return {
          ...c._source,
          _id: c._id,
        };
      });

      console.log(data);
      
      data = data.map(async (c) => {
        try {
          if (c.user_create_id && c.user_create_id !== "") {
            const user_create_data = await getDocumentById(c.user_create_id);
            c.user_create = { name: user_create_data?.name ?? null };
          }
          delete c.user_create_id;
        } catch (error) {
          console.log(error);
        }
        return c;
      });
      data = await Promise.all(data);

      return res.status(200).json(data);
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
