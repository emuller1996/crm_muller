import { Router } from "express";
import { buscarElasticByType } from "../utils/index.js";

const PagosRouters = Router();

PagosRouters.get("/", async (req, res) => {
  try {
    var data = await buscarElasticByType("pago");
    /* return res.json(searchResult.body.hits); */
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

export default PagosRouters;
