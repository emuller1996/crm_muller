import * as service from "./empresas.service.js";

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

export const uploadLogo = async (req, res) => {
  try {
    const file = req.files?.logo;
    if (!file) {
      return res.status(400).json({ message: "No se envio ningun archivo" });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({ message: "Formato no permitido. Solo imagenes (JPG, PNG, WebP, GIF, SVG)" });
    }

    const result = await service.uploadLogo(req.params.id, file);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteLogo = async (req, res) => {
  try {
    res.json(await service.deleteLogo(req.params.id));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
