import * as service from "./logs.service.js";

export const pagination = async (req, res) => {
  try {
    const result = await service.pagination({
      ...req.query,
      empresa_id: req.empresaId,
    });
    res.json(result);
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

export const getStats = async (req, res) => {
  try {
    res.json(await service.getStats(req.empresaId));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
