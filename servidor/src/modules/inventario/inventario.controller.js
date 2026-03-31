import * as service from "./inventario.service.js";

export const getResumenInventario = async (req, res) => {
  try {
    res.json(await service.getResumenInventario(req.query));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStockByProducto = async (req, res) => {
  try {
    res.json(await service.getStockByProducto(req.params.id));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMovimientos = async (req, res) => {
  try {
    res.json(await service.getMovimientos(req.query));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMovimientosByProducto = async (req, res) => {
  try {
    res.json(await service.getMovimientosByProducto(req.params.id));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const registrarMovimientoManual = async (req, res) => {
  try {
    const result = await service.registrarMovimientoManual(
      req.body,
      req.headers["access-token"]
    );
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const anularMovimiento = async (req, res) => {
  try {
    res.json(await service.anularMovimiento(req.params.id));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
