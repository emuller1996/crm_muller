/* eslint-disable prettier/prettier */

import { useContext, useState } from 'react'
import AuthContext from '../context/AuthContext'
import {
  getAllFacturaCompraPerDayService,
  getAllFacturaCompraService,
  getAllPagosByFacturaCompraService,
  patchAnularFacturaCompraService,
  postCreateFacturaCompraService,
  postCreatePagoFacturaCompraService,
  putUpdateFacturaCompraService,
} from '../services/facturaCompra.services'

export const useFacturasCompra = () => {
  const [data, setData] = useState(null)
  const [dataDetalle, setDataDetalle] = useState(null)

  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const abortController = new AbortController()
  const signal = abortController.signal
  const { Token } = useContext(AuthContext)

  const getAllFacturaCompra = async () => {
    setLoading(true)
    try {
      const res = await getAllFacturaCompraService(Token, signal)
      if (res.status !== 200) {
        let err = new Error('Error en la petición Fetch')
        err.status = res.status || '00'
        err.statusText = res.statusText || 'Ocurrió un error'
        throw err
      }
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

  const getAllFacturaCompraPerDay = async (date) => {
    const res = await getAllFacturaCompraPerDayService(Token, signal, date)
    if (res.status !== 200) {
      let err = new Error('Error en la petición Fetch')
      err.status = res.status || '00'
      err.statusText = res.statusText || 'Ocurrió un error'
      throw err
    }
    if (!signal.aborted) {
      setData(res.data)
      setError(null)
    }
    return res
  }

  const crearFacturaCompra = async (data) => {
    return postCreateFacturaCompraService(Token, data)
  }

  const actualizarFacturaCompra = async (data, id) => {
    return putUpdateFacturaCompraService(Token, id, data)
  }

  const crearPagoByFacturaCompra = async (data, id) => {
    return postCreatePagoFacturaCompraService(Token, data, id)
  }

  const getPagosByFacturaCompra = async (id) => {
    return getAllPagosByFacturaCompraService(Token, signal, id)
  }

  const anularFacturaCompra = async (id) => {
    return patchAnularFacturaCompraService(Token, id)
  }

  return {
    data,
    error,
    loading,
    getAllFacturaCompra,
    abortController,
    crearFacturaCompra,
    actualizarFacturaCompra,
    anularFacturaCompra,
    crearPagoByFacturaCompra,
    getPagosByFacturaCompra,
    getAllFacturaCompraPerDay,
  }
}
