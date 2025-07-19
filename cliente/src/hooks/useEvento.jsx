/* eslint-disable prettier/prettier */

import { useState } from 'react'
import { getAlFuncionesByEventoIdService, getAllEventoByIdService, getAllEventoService } from '../services/eventos.services'

export const useEvento = () => {
  const [data, setData] = useState([])
  const [dataDetalle, setDataDetalle] = useState(null)
  const [funcionesData, setfuncionesData] = useState(null)

  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const abortController = new AbortController()
  const signal = abortController.signal

  const getAllEvento = async () => {
    setLoading(true)
    setData([])
    try {
      const res = await getAllEventoService()
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

  const getEventoById = async (id) => {
    try {
      const r = await getAllEventoByIdService(id)
      console.log(r.data)
      setDataDetalle(r.data)
    } catch (error) {
      console.log(error)
    }
  }

  const getFuncionesByEvento = async (id) => {
    try {
      const r = await getAlFuncionesByEventoIdService(id)
      console.log(r.data)
      setfuncionesData(r.data)
    } catch (error) {
      console.log(error)
    }
  }


  

  return {
    data,
    error,
    loading,
    getAllEvento,
    getEventoById,
    dataDetalle,
    getFuncionesByEvento,
    funcionesData
  }
}
