import * as service from "./caja.service.js";

export const getAll = async (req, res) => {
  try {
    res.json(await service.getAll(req.empresaId));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const pagination = async (req, res) => {
  try {
    const result = await service.pagination({ ...req.query, empresa_id: req.empresaId });
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getById = async (req, res) => {
  try {
    res.json(await service.getById(req.params.id));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getResumenDia = async (req, res) => {
  try {
    res.json(await service.getResumenDia(req.params.fecha, req.empresaId));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getResumenRango = async (req, res) => {
  try {
    const { fecha_desde, fecha_hasta } = req.query;
    res.json(await service.getResumenRango(fecha_desde, fecha_hasta, req.empresaId));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const create = async (req, res) => {
  try {
    req.body.empresa_id = req.empresaId;
    const result = await service.create(req.body, req.headers["access-token"]);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const update = async (req, res) => {
  try {
    res.json(await service.update(req.params.id, req.body));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const anular = async (req, res) => {
  try {
    res.json(await service.anular(req.params.id));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
