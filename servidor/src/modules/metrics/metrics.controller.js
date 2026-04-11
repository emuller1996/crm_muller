import * as service from "./metrics.service.js";

export const getKPIs = async (req, res) => {
  try {
    res.json(await service.getKPIs(req.empresaId));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getVentasPorDia = async (req, res) => {
  try {
    const dias = parseInt(req.query.dias) || 7;
    res.json(await service.getVentasPorDia(req.empresaId, dias));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTopProductos = async (req, res) => {
  try {
    const limite = parseInt(req.query.limite) || 5;
    res.json(await service.getTopProductos(req.empresaId, limite));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getVentasPorMetodoPago = async (req, res) => {
  try {
    res.json(await service.getVentasPorMetodoPago(req.empresaId));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTopClientes = async (req, res) => {
  try {
    const limite = parseInt(req.query.limite) || 5;
    res.json(await service.getTopClientes(req.empresaId, limite));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStockBajo = async (req, res) => {
  try {
    const limite = parseInt(req.query.limite) || 10;
    res.json(await service.getStockBajo(req.empresaId, limite));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCajaHoy = async (req, res) => {
  try {
    res.json(await service.getCajaHoy(req.empresaId));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
