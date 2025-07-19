import { Router } from "express";
import {
  buscarElasticByType,
  crearElasticByType,
  crearLogsElastic,
  createInMasaDocumentByType,
  getDocumentById,
  updateElasticByType,
} from "../utils/index.js";
import { INDEX_ES_MAIN } from "../config.js";
import { client } from "../db.js";
import xlsx from "xlsx";
import {
  validateTokenClient,
  validateTokenClientMid,
} from "../utils/authjws.js";
import { jwtDecode } from "jwt-decode";
const ProductosRouters = Router();

ProductosRouters.get("/", async (req, res) => {
  try {
    var data = await buscarElasticByType("producto");
    /* return res.json(searchResult.body.hits); */

    data = data.map(async (product) => {
      return {
        ...product,
        categoria: product.category_id
          ? await getDocumentById(product?.category_id)
          : "",
      };
    });
    data = await Promise.all(data);

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

ProductosRouters.get("/pagination", async (req, res) => {
  let type = `producto`;
  let perPage = req.query.perPage ?? 10;
  let page = req.query.page ?? 1;
  let search = req.query.search ?? "";
  let gender = req.query.gender ?? "";
  let category = req.query.category ?? "";
  let published = req.query.published ?? "";

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
                  type: "producto",
                },
              },
            ],
          },
        },
        sort: [
          { "name.keyword": { order: "asc" } }, // Reemplaza con el campo por el que quieres ordenar
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
    if (category !== "" && category) {
      consulta.body.query.bool.filter.push({
        term: {
          "category_id.keyword": category,
        },
      });
    }
    if (published !== "" && published) {
      consulta.body.query.bool.filter.push({
        term: {
          "published": published,
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
        categoria: product.category_id
          ? await getDocumentById(product?.category_id)
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

ProductosRouters.get("/published", async (req, res) => {
  let type = `producto`;
  let perPage = req.query.perPage ?? 10;
  let page = req.query.page ?? 1;
  let search = req.query.search ?? "";
  let gender = req.query.gender ?? "";
  let categoy = req.query.category ?? "";

  try {
    var consulta = {
      index: INDEX_ES_MAIN,
      size: perPage,
      from: (page - 1) * perPage,
      body: {
        query: {
          bool: {
            must: [
              {
                term: {
                  published: {
                    value: "true",
                  },
                },
              },
            ],
            filter: [
              {
                term: {
                  type: "producto",
                },
              },
            ],
          },
        },
        sort: [
          { "name.keyword": { order: "asc" } }, // Reemplaza con el campo por el que quieres ordenar
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
    if (categoy !== "" && categoy) {
      consulta.body.query.bool.filter.push({
        term: {
          "category_id.keyword": categoy,
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
        categoria: product.category_id
          ? await getDocumentById(product?.category_id)
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
ProductosRouters.get("/:id", async (req, res) => {
  try {
    var producto = await getDocumentById(req.params.id);

    if (producto.image_id) {
      let temp = await getDocumentById(producto.image_id);
      producto.imageBase64 = temp.image;
    }
    let images = await getAllImages(req.params.id);
    let stocks = await getAllStock(req.params.id);
    producto.Imagenes = images;
    producto.Stock = stocks;

    crearLogsElastic(
      JSON.stringify(req.headers),
      JSON.stringify(req.body),
      "Se mostro el detalle de un producto."
    );
    return res.status(200).json(producto);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

ProductosRouters.post("/", async (req, res) => {
  try {
    var recinto = {};
    const data = req.body;
    const response = await crearElasticByType(data, "producto");
    //recinto = response.body;
    crearLogsElastic(
      JSON.stringify(req.headers),
      JSON.stringify(req.body),
      "Se Creado  un producto."
    );
    return res.status(201).json({ message: "Producto Creada.", recinto, data });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

ProductosRouters.put("/:id", async (req, res) => {
  try {
    const r = await updateElasticByType(req.params.id, req.body);
    if (r.body.result === "updated") {
      await client.indices.refresh({ index: INDEX_ES_MAIN });
      crearLogsElastic(
        JSON.stringify(req.headers),
        JSON.stringify(req.body),
        "Se ha Actualizado un producto."
      );
      return res.json({ message: "Producto Actualizado" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

ProductosRouters.post("/:id/stock", async (req, res) => {
  try {
    const dataStock = req.body;
    dataStock.product_id = req.params.id;

    //validacion usuario.
    const requestEL = await client.search({
      index: INDEX_ES_MAIN,
      size: 1000,
      body: {
        query: {
          bool: {
            must: [
              {
                term: {
                  type: {
                    value: "stock",
                  },
                },
              },
              {
                term: {
                  product_id: {
                    value: req.params.id,
                  },
                },
              },
              {
                term: {
                  "size.keyword": {
                    value: dataStock.size,
                  },
                },
              },
            ],
          },
        },
      },
    });

    if (requestEL.body.hits.total.value > 0) {
      return res.status(400).json({
        ...requestEL,
        message: "Talla ya esta Registrada en Stock.",
        detail: `Ya hay una Talla  '${dataStock.size}' con stock.`,
        error: true,
      });
    }

    const resElasCreateStock = await crearElasticByType(dataStock, "stock");

    let user_id = jwtDecode(req.headers["access-token"])._id;
    let product_id = req.params.id;
    let cantidad = req.body.stock;
    const dataCreateLog = {
      user_id,
      product_id,
      cantidad,
      descripcion: "Se Agrego una Talla",
      size: req.body.size,
      stock_id: resElasCreateStock.body._id,
    };
    await crearElasticByType(dataCreateLog, "product_log");
    return res
      .status(201)
      .json({ message: "Stock del producto creada.", dataStock });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

ProductosRouters.post("/:id/images", async (req, res) => {
  try {
    const dataImage = req.body;
    const ImageCreate = {
      product_id: req.params.id,
      image: dataImage.image,
    };
    const resElasCreateFun = await crearElasticByType(ImageCreate, "imagen");
    //recinto = response.body;
    crearLogsElastic(
      JSON.stringify(req.headers),
      JSON.stringify(req.body),
      "Se ha cargado nueva imagen a un producto."
    );
    return res
      .status(201)
      .json({ message: "Producto Creada.", resElasCreateFun });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

ProductosRouters.get("/:id/images", async (req, res) => {
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
                  type: {
                    value: "imagen",
                  },
                },
              },
              {
                term: {
                  product_id: {
                    value: req.params.id,
                  },
                },
              },
            ],
          },
        },
        sort: [
          { createdTime: { order: "asc" } }, // Reemplaza con el campo por el que quieres ordenar
        ],
      },
    });
    const dataImages = searchResult.body.hits.hits.map((c) => {
      return {
        ...c._source,
        _id: c._id,
      };
    });
    return res.status(200).json(dataImages);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

ProductosRouters.post(
  "/:id/consultas",
  validateTokenClientMid,
  async (req, res) => {
    try {
      const dataImage = req.body;

      const accessToken = req.headers["authorization"];
      const decoded = jwtDecode(accessToken);
      const ImageCreate = {
        ...dataImage,
        product_id: req.params.id,
        status: "pending",
        client_id: decoded._id,
      };
      const resElasCreateFun = await crearElasticByType(
        ImageCreate,
        "consulta"
      );
      //recinto = response.body;
      crearLogsElastic(
        JSON.stringify(req.headers),
        JSON.stringify(req.body),
        "Se ha cargado nueva consulta a un producto."
      );
      return res
        .status(201)
        .json({ message: "Consulta Creada." /* resElasCreateFun */ });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
);

ProductosRouters.get("/:id/consultas", async (req, res) => {
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
                  type: {
                    value: "consulta",
                  },
                },
              },
              {
                term: {
                  product_id: {
                    value: req.params.id,
                  },
                },
              },
              {
                terms: {
                  status: ["pending", "completed"],
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
    let dataImages = searchResult.body.hits.hits.map((c) => {
      return {
        ...c._source,
        _id: c._id,
      };
    });
    dataImages = dataImages.map(async (c) => {
      let cliente = await getDocumentById(c.client_id);
      let respuestas = await getAllRespuestasByConsulta(c._id);

      return {
        ...c,
        cliente: {
          name_client: cliente.name_client,
          email_client: cliente.email_client,
          phone_client: cliente.phone_client,
        },
        respuestas,
      };
    });

    dataImages = await Promise.all(dataImages);
    return res.status(200).json(dataImages);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

const getAllRespuestasByConsulta = async (consulta_id) => {
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
                  "consulta_id.keyword": consulta_id,
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

    var data = searchResult.body.hits.hits.map(async (c) => {
      let user = await getDocumentById(c._source.user_id);
      return {
        ...c._source,
        _id: c._id,
        user: { name: user.name, role: user.role },
      };
    });
    data = await Promise.all(data);
    return data;
  } catch (error) {
    console.log(error);
  }
};

ProductosRouters.get("/:id/stock", async (req, res) => {
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
                  type: {
                    value: "stock",
                  },
                },
              },
              {
                term: {
                  product_id: {
                    value: req.params.id,
                  },
                },
              },
            ],
          },
        },
        sort: [
          { createdTime: { order: "asc" } }, // Reemplaza con el campo por el que quieres ordenar
        ],
      },
    });
    const dataImages = searchResult.body.hits.hits.map((c) => {
      return {
        ...c._source,
        _id: c._id,
      };
    });
    return res.status(200).json(dataImages);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

ProductosRouters.get("/:id/stock/logs", async (req, res) => {
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
                  type: {
                    value: "product_log",
                  },
                },
              },
              {
                term: {
                  product_id: {
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
    let dataImages = searchResult.body.hits.hits.map((c) => {
      return {
        ...c._source,
        _id: c._id,
      };
    });
    dataImages = dataImages.map(async (product) => {
      return {
        ...product,
        user: product.user_id
          ? (await getDocumentById(product?.user_id))['name']
          : "",
      };
    });
    dataImages = await Promise.all(dataImages);
    return res.status(200).json(dataImages);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

ProductosRouters.put("/stock/:idStock", async (req, res) => {
  try {
    let dataTest = await getDocumentById(req.params.idStock);

    let user_id = jwtDecode(req.headers["access-token"])._id;
    let product_id = dataTest.product_id;
    let cantidad = req.body.stock - dataTest.stock;
    const dataCreateLog = {
      user_id,
      product_id,
      cantidad,
      descripcion: "Se Actualizo la Talla",
      size: req.body.size,
      stock_id: req.params.idStock,
    };
    console.log(req.body.stock - dataTest.stock);
    const r = await updateElasticByType(req.params.idStock, req.body);
    const result2 = await crearElasticByType(dataCreateLog, "product_log");
    if (r.body.result === "updated") {
      await client.indices.refresh({ index: INDEX_ES_MAIN });
      return res.json({ message: "Stock Actualizado", result2 });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

ProductosRouters.post("/stock/:idStock/validate", async (req, res) => {
  try {
    const resutl = await getDocumentById(req.params.idStock);
    const resutl_sce = await getDocumentById(resutl.product_id);
    const resutl_img = await getDocumentById(resutl_sce.image_id);

    resutl.product = resutl_sce;
    resutl.image = resutl_img;
    if (req.body.cantidad > resutl.stock) {
      return res.status(400).json({ message: "error", resutl });
    }

    return res.status(200).json({ message: "test", resutl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

ProductosRouters.post("/import-excel", async (req, res) => {
  try {
    const { file } = req.files;
    if (!file) {
      return res.status(400).send("No se ha seleccionado ningún archivo");
    }

    const workbook = xlsx.readFile(file.tempFilePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    var data = xlsx.utils.sheet_to_json(worksheet);

    data = data.map((da) => {
      return { ...da, published: false };
    });

    const r = await createInMasaDocumentByType(data, "producto");

    return res.status(200).json({ message: "Importada Realizada", data: r });
  } catch (error) {
    res.status(500).send("Error al procesar el archivo: " + error.message);
  }
});

const getAllImages = async (idProduc) => {
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
                  type: {
                    value: "imagen",
                  },
                },
              },
              {
                term: {
                  product_id: {
                    value: idProduc,
                  },
                },
              },
            ],
          },
        },
        sort: [
          { createdTime: { order: "asc" } }, // Reemplaza con el campo por el que quieres ordenar
        ],
      },
    });
    const dataImages = searchResult.body.hits.hits.map((c) => {
      return {
        ...c._source,
        _id: c._id,
      };
    });
    return dataImages;
  } catch (error) {
    return error;
  }
};

const getAllStock = async (idProduc) => {
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
                  type: {
                    value: "stock",
                  },
                },
              },
              {
                term: {
                  product_id: {
                    value: idProduc,
                  },
                },
              },
            ],
          },
        },
        sort: [
          { createdTime: { order: "asc" } }, // Reemplaza con el campo por el que quieres ordenar
        ],
      },
    });
    const dataImages = searchResult.body.hits.hits.map((c) => {
      return {
        ...c._source,
        _id: c._id,
      };
    });
    return dataImages;
  } catch (error) {
    return error;
  }
};
export default ProductosRouters;
