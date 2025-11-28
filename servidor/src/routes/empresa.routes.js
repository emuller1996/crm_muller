import { Router } from "express";
import { client } from "../db.js";
import {
  buscarElasticByType,
  crearElasticByType,
  getDocumentById,
} from "../utils/index.js";

const EmpresaRouters = Router();

EmpresaRouters.get("/", async (req, res) => {
  try {
    var data = await buscarElasticByType("Empresa");
    return res.status(200).json(data[0] ?? null);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

EmpresaRouters.post("/", async (req, res) => {
  try {
    const dataEmpresa = req.body;
    const response = await crearElasticByType(dataEmpresa, "Empresa");
    return res.status(201).json(response);
  } catch (error) {
    return res.status(500).json(error);
  }
});

export default EmpresaRouters;
