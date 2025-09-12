import { Router } from "express";
import xlsx from "xlsx";
// Importar todos los routers;
// Ejemplo: const authRouter = require('./auth.js');
import { client } from "../db.js";
import {
  buscarElasticByType,
  crearElasticByType,
  crearLogsElastic,
  createInMasaDocumentByType,
  getDocumentById,
  updateElasticByType,
} from "../utils/index.js";
import md5 from "md5";
import {
  generateClienteAccessToken,
  validateTokenClient,
  validateTokenClientMid,
  validateTokenMid,
} from "../utils/authjws.js";
import { INDEX_ES_MAIN } from "../config.js";
import { jwtDecode } from "jwt-decode";
import { sendVerificationEmail } from "../services/mailService.js";
const ClienteRouters = Router();

ClienteRouters.get("/", validateTokenMid, async (req, res) => {
  try {
    var clientes = await buscarElasticByType("cliente");
    /* clientes = clientes.map(async (c) => {
      if (c.ruta_id && c.ruta_id !== "") {
        try {
          const re = await getDocumentById(c.ruta_id);
          return {
            ...c,
            ruta_view: { ...re.body._source, _id: re.body._id },
          };
        } catch (error) {
          return c;
        }
      } else {
        return c;
      }
    }); */
    clientes = await Promise.all(clientes);
    /* return res.json(searchResult.body.hits); */
    return res.status(200).json(clientes);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});



ClienteRouters.get("/pagination_old", async (req, res) => {
  let perPage = req.query.perPage ?? 10;
  let page = req.query.page ?? 1;
  let search = req.query.search ?? "";
  let gender = req.query.gender ?? "";

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
                  type: "cliente",
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
    if (gender !== "" && gender) {
      consulta.body.query.bool.filter.push({
        term: {
          "gender.keyword": gender,
        },
      });
    }
    if (search !== "" && search) {
      consulta.body.query.bool.must.push({
        query_string: {
          query: `*${search}*`,
          fields: ["name_client", "email_client", "phone_client", "123458477"],
        },
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
        categoria: product.category_id
          ? await getDocumentById(product?.category_id)
          : "",
      };
    });
    data = await Promise.all(data);

    return res.status(200).json({
      data: data,
      total: searchResult.body.hits.total.value,
      total_pages: Math.ceil(searchResult.body.hits.total.value / perPage),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

ClienteRouters.get("/pagination", async (req, res) => {
  let perPage = req.query.perPage ?? 10;
  let page = req.query.page ?? 1;
  let search = req.query.search ?? "";

  try {
    var consulta = {
      index: INDEX_ES_MAIN,
      size: perPage,
      from: (page - 1) * perPage,
      body: {
        query: {
          bool: {
            must: [],
            filter: [
              {
                term: {
                  type: "cliente",
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
    if (search !== "" && search) {
      consulta.body.query.bool.must.push({
        query_string: {
          query: `*${search}*`,
          fields: ["name", "telefono", "alias"],
        },
      });
    }
    const searchResult = await client.search(consulta);
    var data = searchResult.body.hits.hits.map(async (c) => {
      if (c._source.user_create_id && c._source.user_create_id !== "") {
        const user_create_data = await getDocumentById(c._source.user_create_id);
        c._source.user_create = { name: user_create_data?.name ?? null };
      }
      return {
        ...c._source,
        _id: c._id,
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
      consulta,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

ClienteRouters.get("/:id", async (req, res) => {
  try {
    var cliente = await getDocumentById(req.params.id);
    return res.status(200).json(cliente);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

ClienteRouters.post(
  "/",
  /*  validateTokenMid, */ async (req, res) => {
    try {
      var customer = {};
      const data = req.body;
      //validacion usuario.
      data.user_create_id = jwtDecode(req.headers[`access-token`])?._id;
      data.createdTime = new Date().getTime();
      const response = await crearElasticByType(data, "cliente");
      customer = response.body;
      return res.status(200).json({
        message: "Cliente Creado.",
        customer,
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
);

ClienteRouters.put(
  "/:id",
  /* validateTokenMid, */ async (req, res) => {
    try {
      const r = await updateElasticByType(req.params.id, req.body);
      if (r.body.result === "updated") {
        await client.indices.refresh({ index: INDEX_ES_MAIN });
        return res.json({ message: "Cliente Actualizado" });
      }
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
);

ClienteRouters.post(
  "/:id/comments",
  /* validateTokenMid, */ async (req, res) => {
    const dataComentarioCliente = req.body;
    const resElasCreate = await crearElasticByType(
      dataComentarioCliente,
      "comentario"
    );
    return res.status(200).json({
      message: "Se creo el comentario correctamente. ",
      resElasCreate,
    });
  }
);

ClienteRouters.get(
  "/:id/comments",
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
                      value: "comentario",
                    },
                  },
                },
                {
                  term: {
                    "clien_id.keyword": {
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

      const dataFuncion = searchResult.body.hits.hits.map((c) => {
        return {
          ...c._source,
          _id: c._id,
        };
      });
      return res.status(200).json(dataFuncion);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
);

ClienteRouters.post("/import-excel", async (req, res) => {
  try {
    const { file } = req.files;
    console.log(file);
    if (!file) {
      return res.status(400).send("No se ha seleccionado ningún archivo");
    }
    const workbook = xlsx.readFile(file.tempFilePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(worksheet);
    /* console.log(data); */
    const r = await createInMasaDocumentByType(data, "cliente");
    console.log(r);

    return res.status(200).json({ message: "Importada Realizada" });
  } catch (error) {
    res.status(500).send("Error al procesar el archivo: " + error.message);
  }
});

export default ClienteRouters;
