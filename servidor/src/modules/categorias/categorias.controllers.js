// categorias.controller.js
import * as service from "./categorias.services.js";

export const getAll = async (req, res) => {
  try {
    const data = await service.getAll(req.empresaId);
    res.json(data);
  } catch (e) {
    res.status(500).json({ 
      success: false, 
      message: "Error al obtener categorías",
      error: e.message 
    });
  }
};

export const create = async (req, res) => {
  try {
    const data = {
      ...req.body,
      empresa_id: req.empresaId,
    };
    const result = await service.create(data);
    return res.status(201).json({
      success: true,
      message: "Categoría creada correctamente",
      data: result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error al crear categoría",
      error: error.message
    });
  }
};

export const update = async (req, res) => {
  try {
    // Verificar que la categoría pertenece a la empresa antes de actualizar
    const existingCategory = await service.getById(req.params.id, req.empresaId);
    
    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: "Categoría no encontrada o no pertenece a esta empresa"
      });
    }
    
    const data = {
      ...req.body,
      updated_at: new Date().toISOString()
    };
    
    const result = await service.update(data, req.params.id);
    
    return res.status(200).json({
      success: true,
      message: "Categoría actualizada correctamente",
      data: result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error al actualizar categoría",
      error: error.message
    });
  }
};

// Nuevo método opcional: eliminar con verificación de empresa
export const remove = async (req, res) => {
  try {
    const existingCategory = await service.getById(req.params.id, req.empresaId);
    
    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: "Categoría no encontrada o no pertenece a esta empresa"
      });
    }
    
    await service.remove(req.params.id);
    
    return res.status(200).json({
      success: true,
      message: "Categoría eliminada correctamente"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error al eliminar categoría",
      error: error.message
    });
  }
};