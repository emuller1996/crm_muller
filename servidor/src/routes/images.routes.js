import { Router } from "express";
import {
  getDocumentById,
} from "../utils/index.js";
import { INDEX_ES_MAIN } from "../config.js";
import { client } from "../db.js";

const ImagesRouters = Router();

ImagesRouters.get("/:id", async (req, res) => {
  try {
    var producto = await getDocumentById(req.params.id);
    if (producto.image_id) {
      let temp = await getDocumentById(producto.image_id);
      producto.imageBase64 = temp.image;
    }
    return res.status(200).json(producto);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

export default ImagesRouters;
