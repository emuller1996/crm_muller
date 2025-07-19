import { Router } from "express";
import {
  buscarElasticByType,
  crearElasticByType,
  createInMasaDocumentByType,
  getDocumentById,
  updateElasticByType,
} from "../utils/index.js";
import { client } from "../db.js";
const INDEX_ES = "eventosmull";

const PuntoVentaRouters = Router();

PuntoVentaRouters.get("/", async (req, res) => {
  try {
    var data = await buscarElasticByType("punto_venta");
    /* return res.json(searchResult.body.hits); */
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

PuntoVentaRouters.get("/:id", async (req, res) => {
  try {
    var funcion = await getDocumentById(req.params.id);

    return res.status(200).json(funcion);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

PuntoVentaRouters.post("/", async (req, res) => {
  try {
    var recinto = {};
    const data = req.body;
    const response = await crearElasticByType(data, "punto_venta");
    //recinto = response.body;

    return res
      .status(201)
      .json({ message: "Punto de Venta Creado.", recinto, data });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

PuntoVentaRouters.patch("/:id", async (req, res) => {
  try {
    var recinto = {};
    const data = req.body;
    const response = await updateElasticByType(req.params.id, data);
    //recinto = response.body;
    return res
      .status(201)
      .json({ message: "Punto de Venta Creado.", response, data });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

export default PuntoVentaRouters;
