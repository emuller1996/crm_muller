import { Router } from "express";

import axios from "axios";
import {
  buscarElasticByType,
  crearElasticByType,
  crearLogsElastic,
  getDocumentById,
  updateElasticByType,
} from "../utils/index.js";
import { INDEX_ES_MAIN } from "../config.js";
import { client } from "../db.js";
import { sendOrdenDetail } from "../services/mailService.js";
import { getHTMLOrderDetail } from "../services/MailUtils.js";
const OrdenesRouters = Router();

OrdenesRouters.post("/process_payment", async (req, res) => {
  let data = req.body;
  let ordenData = req.body.orderData;
  let paymentMercado = req.body.paymentMercado;

  delete data.ordenData;
  console.log(req.body);
  console.log(data);
  console.log(ordenData);
  try {
    const t = await axios.post(
      "https://api.mercadopago.com/v1/payments",
      paymentMercado,
      {
        headers: { Authorization: `Bearer ${process.env.ACCESS_TOKEN}` },
      }
    );
    console.log(t.data);
    ordenData.mercadopago_id = t.data.id;
    ordenData.payment_method = "Tarjeta";
    ordenData.status = "Pendiente";
    if (t.data.status === "approved") {
      const response = await crearElasticByType(ordenData, "orden");
      let order = response.body;
      var ordenDataSend = await getDocumentById(response.body._id);

      if (ordenDataSend.address_id) {
        let temp = await getDocumentById(ordenDataSend.address_id);
        ordenDataSend.address = temp;
      }
      console.log(ordenDataSend.products);
      var productosData = ordenDataSend.products.map(async (c) => {
        //console.log(await getDocumentById(c.product_id));
        let image_id = (await getDocumentById(c.product_id)).image_id;
        return {
          ...c,
          producto_data: await getDocumentById(c.product_id),
          stock_data: await getDocumentById(c.stock_id),
          image_id,
          image: (await getDocumentById(image_id)).image,
        };
      });
      productosData = await Promise.all(productosData);

      console.log(productosData);
      ordenDataSend.products = productosData;
      await sendOrdenDetail(ordenDataSend)
      return res.json({ message: "Melo", order, mercaResponse: t.data });
    } else {
      return res.json({
        message: "ERROR EN EL PAGO CON TARJETA",
        mercaResponse: t.data,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
});

/* OrdenesRouters.get("/", async (req, res) => {
  try {
    var ordenes = await buscarElasticByType("orden");
    ordenes = ordenes.map(async (or) => {
      if (or.evento_id) {
        or.evento = await getDocumentById(or.evento_id);
      }
      if (or.mercadopago_id) {
        const r = await axios.get(
          `https://api.mercadopago.com/v1/payments/${or.mercadopago_id}`,
          {
            headers: { Authorization: `Bearer ${process.env.ACCESS_TOKEN}` },
          }
        );
        or.mercadopago_data = r.data;
      }
      return or;
    });
    ordenes = await Promise.all(ordenes);
    return res.status(200).json(ordenes);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}); */

OrdenesRouters.put("/:id", async (req, res) => {
  try {
    const r = await updateElasticByType(req.params.id, req.body);
    if (r.body.result === "updated") {
      await client.indices.refresh({ index: INDEX_ES_MAIN });
      crearLogsElastic(
        JSON.stringify(req.headers),
        JSON.stringify(req.body),
        "Se ha Actualizado un Orden."
      );
      return res.json({ message: "Orden  Actualizada" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

OrdenesRouters.get("/pagination", async (req, res) => {
  let perPage = req.query.perPage ?? 10;
  let page = req.query.page ?? 1;
  let search = req.query.search ?? "";
  let status = req.query.status ?? "";
  console.log(req.query);
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
                  type: "orden",
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
        query_string: {
          query: `*${search}*`,
          fields: [
            "cliente.name_client",
            "cliente.email_client",
            "cliente.phone_client",
            "cliente.number_document_client",
          ],
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
        /*  cliente: product.client_id
          ? await getDocumentById(product?.client_id)
          : "", */
        address: product.address_id
          ? await getDocumentById(product?.address_id)
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

OrdenesRouters.get("/:id", async (req, res) => {
  try {
    var orden = await getDocumentById(req.params.id);

    if (orden.address_id) {
      let temp = await getDocumentById(orden.address_id);
      orden.address = temp;
    }
    console.log(orden.products);
    if (orden.mercadopago_id) {
        const r = await axios.get(
          `https://api.mercadopago.com/v1/payments/${orden.mercadopago_id}`,
          {
            headers: { Authorization: `Bearer ${process.env.ACCESS_TOKEN}` },
          }
        );
        orden.mercadopago_data = r.data;
      }
    var productosData = orden.products.map(async (c) => {
      //console.log(await getDocumentById(c.product_id));
      let image_id = (await getDocumentById(c.product_id)).image_id;
      return {
        ...c,
        producto_data: await getDocumentById(c.product_id),
        stock_data: await getDocumentById(c.stock_id),
        image_id,
        image: (await getDocumentById(image_id)).image,
      };
    });
    productosData = await Promise.all(productosData);

    console.log(productosData);
    orden.products = productosData;

    let html = getHTMLOrderDetail(orden);
        console.log(html);

    crearLogsElastic(
      JSON.stringify(req.headers),
      JSON.stringify(req.body),
      "Se mostro el detalle de un orden."
    );
    return res.status(200).json(orden);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

OrdenesRouters.post("/webhooks", async (req, res) => {
  console.log(req.body);
  const data = req.body;
  if (data.action === "payment.updated") {
    try {
      const payment_mercado = (
        await axios.get(
          `https://api.mercadopago.com/v1/payments/${data.data.id}`,
          {
            headers: { Authorization: `Bearer ${process.env.ACCESS_TOKEN}` },
          }
        )
      ).data;
      console.log(payment_mercado);
      let pagoDatos ={
        status: payment_mercado.status,
        net_received_amount:
          payment_mercado?.transaction_details?.net_received_amount,
        net_amount: payment_mercado.transaction_amount,
        fee_details_amount: payment_mercado?.fee_details?.[0]?.amount,
        net_amount: payment_mercado?.net_amount,
        status_detail: payment_mercado?.status_detail,
      };
      const response = await crearElasticByType(pagoDatos, "pago");

      if(payment_mercado.status==="approved"){
        //Buscar Orden y productos para dar de bajar el inventario 
        //Enviar email del pago 
      }
      //console.log(pago);
    } catch (error) {
      console.log(error);
    }
    return res.status(200).json({});
  }
});

export default OrdenesRouters;
