import * as service from "./productos.service.js";
import { jwtDecode } from "jwt-decode";

export const getAll = async (req, res) => {
  try {
    const data = await service.getAll();
    res.json(data);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const pagination = async (req, res) => {
  try {
    const result = await service.pagination(req);
    res.json(result);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const getPublished = async (req, res) => {
  try {
    const result = await service.getPublished(req.query);
    res.json(result);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const getById = async (req, res) => {
  try {
    const product = await service.getById(req.params.id);
    res.json(product);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const create = async (req, res) => {
  try {
    await service.create(req.body);
    res.status(201).json({ message: "Producto creado" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const update = async (req, res) => {
  try {
    await service.update(req.params.id, req.body);
    res.json({ message: "Producto actualizado" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const createStock = async (req, res) => {
  try {
    const userId = jwtDecode(req.headers["access-token"])._id;
    await service.createStock(req.params.id, req.body, userId);
    res.status(201).json({ message: "Stock creado" });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

export const updateStock = async (req, res) => {
  try {
    const userId = jwtDecode(req.headers["access-token"])._id;
    const result = await service.updateStock(
      req.params.idStock,
      req.body,
      userId
    );
    res.json(result);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const getStock = async (req, res) => {
  res.json(await service.getStock(req.params.id));
};

export const getStockLogs = async (req, res) => {
  res.json(await service.getStockLogs(req.params.id));
};

export const createImage = async (req, res) => {
  res.status(201).json(await service.createImage(req.params.id, req.body));
};

export const getImages = async (req, res) => {
  res.json(await service.getImages(req.params.id));
};

export const createConsulta = async (req, res) => {
  const decoded = jwtDecode(req.headers["authorization"]);
  await service.createConsulta(req.params.id, req.body, decoded._id);
  res.status(201).json({ message: "Consulta creada" });
};

export const getConsultas = async (req, res) => {
  res.json(await service.getConsultas(req.params.id));
};

export const validateStock = async (req, res) => {
  res.json(await service.validateStock(req.params.idStock, req.body));
};

export const importExcel = async (req, res) => {
  await service.importExcel(req.files);
  res.json({ message: "Importación realizada" });
};