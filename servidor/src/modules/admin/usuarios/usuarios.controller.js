import * as service from "./usuarios.service.js";

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

export const create = async (req, res) => {
  try {
    const result = await service.create(req.body);
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

export const changePassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ message: "La contrasena debe tener al menos 6 caracteres" });
    }
    res.json(await service.changePassword(req.params.id, password));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const disable = async (req, res) => {
  try {
    res.json(await service.disable(req.params.id));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const enable = async (req, res) => {
  try {
    res.json(await service.enable(req.params.id));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
