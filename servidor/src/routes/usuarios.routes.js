import { Router } from "express";
import {
  buscarElasticByType,
  crearElasticByType,
  getDocumentById,
} from "../utils/index.js";

import md5 from "md5";

const UsuariosRouters = Router();

UsuariosRouters.get("/", async (req, res) => {
  try {
    var data = await buscarElasticByType("usuario");
    /* return res.json(searchResult.body.hits); */
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

UsuariosRouters.get("/:id", async (req, res) => {
  try {
    var funcion = await getDocumentById(req.params.id);

    return res.status(200).json(funcion);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

UsuariosRouters.post("/", async (req, res) => {
  try {
    var recinto = {};
    const data = req.body;

    data.password = md5(data.password);
    const response = await crearElasticByType(data, "usuario");
    //recinto = response.body;
    return res.status(201).json({ message: "Usuario Creado.", recinto, data });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

export default UsuariosRouters;
