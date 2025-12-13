/* eslint-disable prettier/prettier */

import { useContext, useState } from 'react'
import AuthContext from '../context/AuthContext'
import {
  getAllFacturaPerDayService,
  getAllFacturaService,
  getAllPagosByFacturaService,
  postCreateFacturaService,
  postCreatePagoFacturaService,
  putUpdateFacturaService,
} from '../services/factura.services'

export const useFacturas = () => {
  const [data, setData] = useState(null)
  const [dataDetalle, setDataDetalle] = useState(null)

  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const abortController = new AbortController()
  const signal = abortController.signal
  const { Token } = useContext(AuthContext)

  const getAllFactura = async () => {
    setLoading(true)
    try {
      const res = await getAllFacturaService(Token, signal)
      if (res.status !== 200) {
        let err = new Error('Error en la petición Fetch')
        err.status = res.status || '00'
        err.statusText = res.statusText || 'Ocurrió un error'
        throw err
      }
      console.log(res)
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
      if (!signal.aborted) {
        setLoading(false)
      }
    }
  }

  const getAllFacturaPerDay = async (date) => {
    const res = await getAllFacturaPerDayService(Token, signal, date)
    if (res.status !== 200) {
      let err = new Error('Error en la petición Fetch')
      err.status = res.status || '00'
      err.statusText = res.statusText || 'Ocurrió un error'
      throw err
    }
    console.log(res)
    if (!signal.aborted) {
      setData(res.data)
      setError(null)
    }
    return res
  }

  const crearFactura = async (data) => {
    return postCreateFacturaService(Token, data)
  }

  const actualizarFactura = async (data, id) => {
    return putUpdateFacturaService(Token, id, data)
  }

  const crearPagoByFactura = async (data, id) => {
    return postCreatePagoFacturaService(Token, data, id)
  }

  const getPagosByFactura = async (id) => {
    return getAllPagosByFacturaService(Token, signal, id)
  }

  return {
    data,
    error,
    loading,
    getAllFactura,
    abortController,
    crearFactura,
    actualizarFactura,
    crearPagoByFactura,
    getPagosByFactura,
    getAllFacturaPerDay,
  }
}
