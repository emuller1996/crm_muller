/* eslint-disable prettier/prettier */

import { useState } from 'react'
import {
  getAllEsquemasByRecintosService,
  getAllRecintosService,
} from '../services/recinto.services'

export const useRecintos = () => {
  const [data, setData] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [esquemasRecinto, setEsquemasRecinto] = useState(null)
  const abortController = new AbortController()
  const signal = abortController.signal

  const getAllRecintos = async () => {
    setLoading(true)
    setData([])
    try {
      const res = await getAllRecintosService()
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

  const getEsquemasByRecinto = async (idRecinto) => {
    try {
      const r = await getAllEsquemasByRecintosService(idRecinto)
      console.log(r.data)
      setEsquemasRecinto(r.data)
    } catch (error) {
      console.log(error);
      
    }
  }

  return {
    data,
    error,
    loading,
    getAllRecintos,
    getEsquemasByRecinto,
    esquemasRecinto
  }
}
