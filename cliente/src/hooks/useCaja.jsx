/* eslint-disable prettier/prettier */

import { useContext, useState } from 'react'
import {
  getAllCajaService,
  getCajaPaginationService,
  getCajaResumenDiaService,
  getCajaResumenRangoService,
  postCreateMovimientoService,
  putUpdateMovimientoService,
  patchAnularMovimientoService,
} from '../services/caja.services'
import AuthContext from '../context/AuthContext'

export const useCaja = () => {
  const [data, setData] = useState(null)
  const [dataP, setDataP] = useState(undefined)
  const [resumenDia, setResumenDia] = useState(null)
  const [resumenRango, setResumenRango] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const abortController = new AbortController()
  const signal = abortController.signal
  const { Token } = useContext(AuthContext)

  const getAllMovimientos = async () => {
    setLoading(true)
    try {
      const res = await getAllCajaService(Token, signal)
      if (!signal.aborted) {
        setData(res.data)
        setError(null)
      }
    } catch (error) {
      if (!signal.aborted) {
        setData(null)
        setError(error)
      }
    } finally {
      if (!signal.aborted) setLoading(false)
    }
  }

  const getAllMovimientosPagination = async (data) => {
    setLoading(true)
    setDataP(undefined)
    try {
      const res = await getCajaPaginationService(Token, data)
      if (!signal.aborted) {
        setDataP(res.data)
        setError(null)
      }
    } catch (error) {
      if (!signal.aborted) {
        setDataP(undefined)
        setError(error)
      }
    } finally {
      if (!signal.aborted) setLoading(false)
    }
  }

  const getResumenDia = async (fecha) => {
    setLoading(true)
    try {
      const res = await getCajaResumenDiaService(Token, fecha)
      if (!signal.aborted) {
        setResumenDia(res.data)
        setError(null)
      }
    } catch (error) {
      if (!signal.aborted) {
        setResumenDia(null)
        setError(error)
      }
    } finally {
      if (!signal.aborted) setLoading(false)
    }
  }

  const getResumenRango = async (fecha_desde, fecha_hasta) => {
    setLoading(true)
    try {
      const res = await getCajaResumenRangoService(Token, fecha_desde, fecha_hasta)
      if (!signal.aborted) {
        setResumenRango(res.data)
        setError(null)
      }
    } catch (error) {
      if (!signal.aborted) {
        setResumenRango(null)
        setError(error)
      }
    } finally {
      if (!signal.aborted) setLoading(false)
    }
  }

  const crearMovimiento = async (data) => {
    return postCreateMovimientoService(Token, data)
  }

  const actualizarMovimiento = async (data, id) => {
    return putUpdateMovimientoService(Token, id, data)
  }

  const anularMovimiento = async (id) => {
    return patchAnularMovimientoService(Token, id)
  }

  return {
    data,
    dataP,
    resumenDia,
    resumenRango,
    error,
    loading,
    abortController,
    getAllMovimientos,
    getAllMovimientosPagination,
    getResumenDia,
    getResumenRango,
    crearMovimiento,
    actualizarMovimiento,
    anularMovimiento,
  }
}
