import { Router } from "express";
import {
  crearElasticByType,
  getDocumentById,
  updateElasticByType,
} from "../utils/index.js";

const EmpresaRouters = Router();

EmpresaRouters.get("/", async (req, res) => {
  try {
    if (!req.empresaId) {
      return res.status(400).json({ message: "El usuario no tiene empresa asignada" });
    }
    const data = await getDocumentById(req.empresaId);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

EmpresaRouters.post("/", async (req, res) => {
  try {
    const dataEmpresa = req.body;
    const response = await crearElasticByType(dataEmpresa, "empresa");
    return res.status(201).json(response.body);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

EmpresaRouters.put("/", async (req, res) => {
  try {
    if (!req.empresaId) {
      return res.status(400).json({ message: "El usuario no tiene empresa asignada" });
    }
    await updateElasticByType(req.empresaId, req.body);
    return res.status(200).json({ message: "Empresa actualizada" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

export default EmpresaRouters;
