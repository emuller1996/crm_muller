/* eslint-disable prettier/prettier */

import { useContext, useState } from 'react'
import {
  getAllCajasService,
  getCajasSearchPaginationServices,
  postCreateCajaService,
  putUpdateCajaService,
  getCajaByIdService,
  getMisCajasService,
} from '../services/cajas.services'
import AuthContext from '../context/AuthContext'

export const useCajas = () => {
  const [data, setData] = useState(null)
  const [dataP, setDataP] = useState(undefined)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const abortController = new AbortController()
  const signal = abortController.signal
  const { Token } = useContext(AuthContext)

  const getAllCajas = async () => {
    setLoading(true)
    try {
      const res = await getAllCajasService(Token, signal)
      if (res.status !== 200) {
        let err = new Error('Error en la peticion Fetch')
        err.status = res.status || '00'
        err.statusText = res.statusText || 'Ocurrio un error'
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

  const getAllCajasPagination = async (data) => {
    setLoading(true)
    setDataP(undefined)
    try {
      const res = await getCajasSearchPaginationServices(Token, data)
      if (res.status !== 200) {
        let err = new Error('Error en la peticion Fetch')
        err.status = res.status || '00'
        err.statusText = res.statusText || 'Ocurrio un error'
        throw err
      }
      if (!signal.aborted) {
        setDataP(res.data)
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

  const createCaja = async (data) => {
    return postCreateCajaService(Token, data)
  }

  const updateCaja = async (data, id) => {
    return putUpdateCajaService(Token, id, data)
  }

  const getCajaById = async (id) => {
    return getCajaByIdService(Token, id)
  }

  const getMisCajas = async () => {
    return getMisCajasService(Token)
  }

  return {
    data,
    dataP,
    error,
    loading,
    abortController,
    getAllCajas,
    getAllCajasPagination,
    createCaja,
    updateCaja,
    getCajaById,
    getMisCajas,
  }
}
