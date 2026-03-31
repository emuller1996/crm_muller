/* eslint-disable prettier/prettier */

import { useContext, useState } from 'react'
import AuthContext from '../context/AuthContext'
import {
  getResumenInventarioService,
  getMovimientosInventarioService,
  getStockByProductoService,
  getMovimientosByProductoService,
  postRegistrarMovimientoService,
  patchAnularMovimientoService,
} from '../services/inventario.services'

export const useInventario = () => {
  const [resumen, setResumen] = useState(null)
  const [movimientos, setMovimientos] = useState(undefined)
  const [stockProducto, setStockProducto] = useState(null)
  const [historialProducto, setHistorialProducto] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const abortController = new AbortController()
  const signal = abortController.signal
  const { Token } = useContext(AuthContext)

  const getResumenInventario = async (params) => {
    setLoading(true)
    setResumen(undefined)
    try {
      const res = await getResumenInventarioService(Token, params)
      if (!signal.aborted) {
        setResumen(res.data)
        setError(null)
      }
    } catch (error) {
      if (!signal.aborted) {
        setResumen(undefined)
        setError(error)
      }
    } finally {
      if (!signal.aborted) setLoading(false)
    }
  }

  const getMovimientosPagination = async (data) => {
    setLoading(true)
    setMovimientos(undefined)
    try {
      const res = await getMovimientosInventarioService(Token, data)
      if (!signal.aborted) {
        setMovimientos(res.data)
        setError(null)
      }
    } catch (error) {
      if (!signal.aborted) {
        setMovimientos(undefined)
        setError(error)
      }
    } finally {
      if (!signal.aborted) setLoading(false)
    }
  }

  const getStockByProducto = async (id) => {
    return getStockByProductoService(Token, id)
  }

  const getMovimientosByProducto = async (id) => {
    return getMovimientosByProductoService(Token, id)
  }

  const registrarMovimiento = async (data) => {
    return postRegistrarMovimientoService(Token, data)
  }

  const anularMovimiento = async (id) => {
    return patchAnularMovimientoService(Token, id)
  }

  return {
    resumen,
    movimientos,
    stockProducto,
    historialProducto,
    error,
    loading,
    abortController,
    getResumenInventario,
    getMovimientosPagination,
    getStockByProducto,
    getMovimientosByProducto,
    registrarMovimiento,
    anularMovimiento,
  }
}
