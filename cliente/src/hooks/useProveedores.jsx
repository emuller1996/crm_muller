/* eslint-disable prettier/prettier */

import { useContext, useState } from 'react'
import {
  getAllProveedoresService,
  getProveedoresSearchPaginationServices,
  postCreateProveedorService,
  putUpdateProveedorService,
  getProveedorByIdService,
} from '../services/proveedores.services'
import AuthContext from '../context/AuthContext'

export const useProveedores = () => {
  const [data, setData] = useState(null)
  const [dataP, setDataP] = useState(undefined)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const abortController = new AbortController()
  const signal = abortController.signal
  const { Token } = useContext(AuthContext)

  const getAllProveedores = async () => {
    setLoading(true)
    try {
      const res = await getAllProveedoresService(Token, signal)
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

  const getAllProveedoresPagination = async (data) => {
    setLoading(true)
    setDataP(undefined)
    try {
      const res = await getProveedoresSearchPaginationServices(Token, data)
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

  const createProveedor = async (data) => {
    return postCreateProveedorService(Token, data)
  }

  const updateProveedor = async (data, id) => {
    return putUpdateProveedorService(Token, id, data)
  }

  const getProveedorById = async (id) => {
    return getProveedorByIdService(Token, id)
  }

  return {
    data,
    dataP,
    error,
    loading,
    abortController,
    getAllProveedores,
    getAllProveedoresPagination,
    createProveedor,
    updateProveedor,
    getProveedorById,
  }
}
