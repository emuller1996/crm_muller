/* eslint-disable prettier/prettier */

import { useContext, useState } from 'react'
import AuthContext from '../context/AuthContext'
import {
  getAllFacturaPerDayService,
  getAllFacturaService,
  getAllPagosByFacturaService,
  patchAnularFacturaService,
  postCreateFacturaService,
  postCreatePagoFacturaService,
  putUpdateFacturaService,
  getFacturasPaginationService,
} from '../services/factura.services'

export const useFacturas = () => {
  const [data, setData] = useState(null)
  const [dataP, setDataP] = useState(undefined)
  const [dataDetalle, setDataDetalle] = useState(null)

  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const abortController = new AbortController()
  const signal = abortController.signal
  const { Token } = useContext(AuthContext)

  const getAllFacturasPagination = async (params) => {
    setLoading(true)
    setDataP(undefined)
    try {
      const res = await getFacturasPaginationService(Token, params)
      if (!signal.aborted) {
        setDataP(res.data)
        setError(null)
      }
    } catch (err) {
      if (!signal.aborted) {
        setDataP(undefined)
        setError(err)
      }
    } finally {
      if (!signal.aborted) {
        setLoading(false)
      }
    }
  }

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

  const anularFactura = async (id) => {
    return patchAnularFacturaService(Token, id)
  }

  return {
    data,
    dataP,
    error,
    loading,
    getAllFactura,
    getAllFacturasPagination,
    abortController,
    crearFactura,
    actualizarFactura,
    anularFactura,
    crearPagoByFactura,
    getPagosByFactura,
    getAllFacturaPerDay,
  }
}
