import { Router } from "express";
import {
  buscarElasticByType,
  crearElasticByType,
  crearLogsElastic,
  getDocumentById,
  updateElasticByType,
} from "../utils/index.js";
import { jwtDecode } from "jwt-decode";

import md5 from "md5";
import { INDEX_ES_MAIN } from "../config.js";
import { client } from "../db.js";
import { sendRespuestaConsultaEmail } from "../services/mailService.js";

const ConsultasRouters = Router();

ConsultasRouters.get("/", async (req, res) => {
  try {
    var data = await buscarElasticByType("consulta");
    /* return res.json(searchResult.body.hits); */
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

ConsultasRouters.get("/pagination", async (req, res) => {
  let perPage = req.query.perPage ?? 10;
  let page = req.query.page ?? 1;
  let search = req.query.search ?? "";
  let status = req.query.status ?? "";

  try {
    var consulta = {
      index: INDEX_ES_MAIN,
      size: perPage,
      from: (page - 1) * perPage,
      body: {
        query: {
          bool: {
            must: [
              /* { match_phrase_prefix: { name: nameQuery } } */
            ],
            filter: [
              {
                term: {
                  type: "consulta",
                },
              },
            ],
          },
        },
        sort: [
          { createdTime: { order: "desc" } }, // Reemplaza con el campo por el que quieres ordenar
        ],
      },
    };
    if (status !== "" && status) {
      consulta.body.query.bool.filter.push({
        term: {
          "status.keyword": status,
        },
      });
    }
    if (search !== "" && search) {
      consulta.body.query.bool.must.push({
        query_string: { query: `*${search}*`, fields: ["name", "description"] },
      });
    }
    const searchResult = await client.search(consulta);

    var data = searchResult.body.hits.hits.map((c) => {
      return {
        ...c._source,
        _id: c._id,
      };
    });

    data = data.map(async (product) => {
      return {
        ...product,
        producto: product.product_id
          ? await getDocumentById(product?.product_id)
          : "",
        cliente: product.client_id
          ? await getDocumentById(product?.client_id)
          : "",
      };
    });
    data = await Promise.all(data);
    /* return {
      data: data,
      total: searchResult.body.hits.total.value,
      total_pages: Math.ceil(searchResult.body.hits.total.value / perPage),
    }; */

    return res.status(200).json({
      data: data,
      total: searchResult.body.hits.total.value,
      total_pages: Math.ceil(searchResult.body.hits.total.value / perPage),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

ConsultasRouters.get("/:id", async (req, res) => {
  try {
    var funcion = await getDocumentById(req.params.id);

    return res.status(200).json(funcion);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

ConsultasRouters.post("/respuesta", async (req, res) => {
  try {
    const data = req.body;
    const user_token = jwtDecode(req.headers.authorization);
    data.user_id = user_token._id;
    const result = await crearElasticByType(data, "respuesta");
    await updateElasticByType(data.consulta_id, {
      status:"completed"
    });
    var dataRespuesta = await getDocumentById(result.body._id);
    var dataConsulta = await getDocumentById(data.consulta_id);
    var Cliente = await getDocumentById(dataConsulta.client_id);
    var User = await getDocumentById(dataRespuesta.user_id);

    dataRespuesta.cliente = Cliente
    dataRespuesta.user = User
    dataRespuesta.consulta = dataConsulta.consulta
    console.log(dataRespuesta);
    await sendRespuestaConsultaEmail(dataRespuesta)
    return res
      .status(201)
      .json({ message: "Usuario Creado.", data });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

ConsultasRouters.get("/:id/respuesta", async (req, res) => {
  try {
    var consulta = {
      index: INDEX_ES_MAIN,
      size: 9999,
      body: {
        query: {
          bool: {
            must: [
              /* { match_phrase_prefix: { name: nameQuery } } */
            ],
            filter: [
              {
                term: {
                  type: "respuesta",
                },
              },
              {
                term: {
                  "consulta_id.keyword": req.params.id,
                },
              },
            ],
          },
        },
        sort: [
          { createdTime: { order: "desc" } }, // Reemplaza con el campo por el que quieres ordenar
        ],
      },
    };
    const searchResult = await client.search(consulta);
    var data = searchResult.body.hits.hits.map( async(c) => {
      let user =await getDocumentById(c._source.user_id);
      return {
        ...c._source,
        _id: c._id,
        user: { name: user.name , role :user.role}
      };
    });
    data = await Promise.all(data);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

ConsultasRouters.put("/:id", async (req, res) => {
  try {
    const r = await updateElasticByType(req.params.id, req.body);
    if (r.body.result === "updated") {
      await client.indices.refresh({ index: INDEX_ES_MAIN });
      crearLogsElastic(
        JSON.stringify(req.headers),
        JSON.stringify(req.body),
        "Se ha Actualizado un Consulta."
      );
      return res.json({ message: "Consulta Actualizada." });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

export default ConsultasRouters;
