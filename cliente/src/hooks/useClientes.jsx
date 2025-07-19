/* eslint-disable prettier/prettier */

import { useContext, useState } from 'react'
import {
  getAllClientesPaginationService,
  getAllClientesService,
  getClientesSearchPaginationServices,
  getComentarioClientesService,
  getGetAddressClientesService,
  getGetShoppingClientesService,
  getShopByIdService,
  postCreateClientesService,
  postCreateComentarioClientesService,
  postNewAddressClientesService,
  putNewAddressClientesService,
  putUpdateClientesService,
} from '../services/clientes.services'
import AuthContext from '../context/AuthContext'

export const useClientes = () => {
  const [data, setData] = useState(null)
  const [dataDetalle, setDataDetalle] = useState(null)
  const [dataP, setDataP] = useState(undefined)
  const [dataAddress, setDataAddress] = useState(null)
  const [dataShopping, setDataShopping] = useState(null)
  const [dataShopDetail, setDataShopDetail] = useState(null)

  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const abortController = new AbortController()
  const signal = abortController.signal
  const { Token, TokenClient } = useContext(AuthContext)

  const getAllClientes = async () => {
    setLoading(true)
    try {
      const res = await getAllClientesService(Token, signal)
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

  const getAllClientesPagination = async (data) => {
    setLoading(true)
    setDataP(undefined)
    try {
      const res = await getClientesSearchPaginationServices(Token, data)
      if (res.status !== 200) {
        let err = new Error('Error en la petición Fetch')
        err.status = res.status || '00'
        err.statusText = res.statusText || 'Ocurrió un error'
        throw err
      }
      console.log(res)
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

  const CreateCliente = async (data) => {
    return postCreateClientesService(Token, data)
  }

  const updateCliente = async (data, id) => {
    return putUpdateClientesService(Token, id, data)
  }

   const createComentarioByCliente = async (data, id) => {
    return postCreateComentarioClientesService(Token, id, data)
  }

   const getAllComentarioByClientesPaginationPromise = async (client_id) => {
    return getComentarioClientesService(Token, client_id)
  }


  const putClienteById = async (id, data) => {
    return putUpdateClientesService(TokenClient, id, data)
  }

  const postClienteNewAddress = async (data) => {
    try {
      const r = await postNewAddressClientesService(TokenClient, data)
      console.log(r.data)
      setDataDetalle(r.data)
    } catch (error) {
      console.log(error)
    }
  }

  const putClienteNewAddress = async (data, id) => {
    try {
      const r = await putNewAddressClientesService(TokenClient, data, id)
      console.log(r.data)
      setDataDetalle(r.data)
    } catch (error) {
      console.log(error)
    }
  }

  const getAllShoppingByClientes = async () => {
    setLoading(true)
    try {
      const res = await getGetShoppingClientesService(TokenClient, signal)
      if (res.status !== 200) {
        let err = new Error('Error en la petición Fetch')
        err.status = res.status || '00'
        err.statusText = res.statusText || 'Ocurrió un error'
        throw err
      }
      console.log(res)
      if (!signal.aborted) {
        setDataShopping(res.data)
        setError(null)
      }
    } catch (error) {
      if (!signal.aborted) {
        setDataShopping(null)
        setError(error)
      }
    } finally {
      if (!signal.aborted) {
        setLoading(false)
      }
    }
  }

  const getShopDetailById = async (id, data) => {
    return await getShopByIdService(TokenClient, id)
  }

  const getAllAddressByClientes = async () => {
    setLoading(true)
    try {
      const res = await getGetAddressClientesService(TokenClient, signal)
      if (res.status !== 200) {
        let err = new Error('Error en la petición Fetch')
        err.status = res.status || '00'
        err.statusText = res.statusText || 'Ocurrió un error'
        throw err
      }
      console.log(res)
      if (!signal.aborted) {
        setDataAddress(res.data)
        setError(null)
      }
    } catch (error) {
      if (!signal.aborted) {
        setDataAddress(null)
        setError(error)
      }
    } finally {
      if (!signal.aborted) {
        setLoading(false)
      }
    }
  }

  const getAllClientesPaginationPromise = async (data) => {
    return getAllClientesPaginationService(Token, data)
  }

  return {
    data,
    error,
    loading,
    getAllClientes,
    abortController,
    putClienteById,
    postClienteNewAddress,
    getAllAddressByClientes,
    dataAddress,
    getAllShoppingByClientes,
    dataShopping,
    getShopDetailById,
    dataShopDetail,
    putClienteNewAddress,
    getAllClientesPagination,
    dataP,
    CreateCliente,
    updateCliente,
    createComentarioByCliente,
    getAllComentarioByClientesPaginationPromise,
    getAllClientesPaginationPromise
  }
}
