import * as service from "./facturas.service.js";

export const getAll = async (req, res) => {
  try {
    res.json(await service.getAll());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getById = async (req, res) => {
  try {
    res.json(await service.getById(req.params.id));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPerDay = async (req, res) => {
  try {
    res.json(await service.getPerDay(req.params.date));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const create = async (req, res) => {
  try {
    const result = await service.create(
      req.body,
      req.headers["access-token"]
    );

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

export const createPago = async (req, res) => {
  try {
    res.status(201).json(
      await service.createPago(
        req.params.id,
        req.body,
        req.headers["access-token"]
      )
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPagos = async (req, res) => {
  try {
    res.json(await service.getPagos(req.params.id));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};