import * as service from "./cotizaciones.service.js";

export const getAll = async (req, res) => {
  try {
    const data = await service.getAll();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const create = async (req, res) => {
  try {
    const result = await service.create(
      req.body,
      req.headers["access-token"]
    );

    return res.status(201).json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const result = await service.update(req.params.id, req.body);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};