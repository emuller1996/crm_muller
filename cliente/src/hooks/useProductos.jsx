/* eslint-disable prettier/prettier */

import { useContext, useState } from 'react'
import { getAllCategoriasService } from '../services/categorias.services'
import {
  getAllProductoByIdService,
  getAllProductoConsultaService,
  getAllProductoImageService,
  getAllProductoLogsStockService,
  getAllProductoService,
  getAllProductoStockService,
  getProductoSearchPaginationServices,
  getProductoSearchPublishedServices,
  postCreateConsultaProductoService,
  postCreateProductoService,
  postCreateStockProductoService,
  postImportProductoService,
  postValidateStockProductoService,
  putUpdateStockProductoService,
} from '../services/productos.services'
import AuthContext from '../context/AuthContext'
import { setProductsP, setTotalProducts } from '../redux/slices/ProductsSlice'
import { useDispatch } from 'react-redux'

export const useProductos = () => {
  const [data, setData] = useState([])
  const [dataP, setDataP] = useState(undefined)

  const [dataDetalle, setDataDetalle] = useState(null)
  const [ImagesProduct, setImagesProduct] = useState(null)
  const [StockProduct, setStockProduct] = useState(null)
  const [StockProductLogs, setStockProductLogs] = useState(null)
  const [ConsultasProduct, setConsultasProduct] = useState(null)

  const dispatch = useDispatch()

  const { Token, TokenClient } = useContext(AuthContext)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const abortController = new AbortController()
  const signal = abortController.signal

  const getAllProductos = async () => {
    setLoading(true)
    setData([])
    try {
      const res = await getAllProductoService(Token, signal)
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

  const getAllProductosPagination = async (data) => {
    setLoading(true)
    setDataP(undefined)
    try {
      const res = await getProductoSearchPaginationServices(Token, data)
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

  const getAllProductosPublished = async (data) => {
    setLoading(true)
    setDataP(undefined)
    try {
      const res = await getProductoSearchPublishedServices(Token, data)
      if (res.status !== 200) {
        let err = new Error('Error en la petición Fetch')
        err.status = res.status || '00'
        err.statusText = res.statusText || 'Ocurrió un error'
        throw err
      }
      console.log(res)
      if (!signal.aborted) {
        //setDataP(res.data)
        dispatch(setProductsP(res.data.data))
        dispatch(setTotalProducts({ total: res.data.total, page: res.data.total_pages }))
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

  const getImagesByProductId = async (id) => {
    try {
      const r = await getAllProductoImageService(id, signal)
      console.log(r.data)
      setImagesProduct(r.data)
    } catch (error) {
      console.log(error)
    }
  }

  const getStockByProductId = async (id) => {
    try {
      const r = await getAllProductoStockService(id, signal)
      console.log(r.data)
      setStockProduct(r.data)
    } catch (error) {
      console.log(error)
    }
  }
  const getStocLogsByProductId = async (id) => {
    try {
      const r = await getAllProductoLogsStockService(id, signal)
      console.log(r.data)
      setStockProductLogs(r.data)
    } catch (error) {
      console.log(error)
    }
  }

  const getConsultakByProductId = async (id) => {
    try {
      const r = await getAllProductoConsultaService(id, signal)
      console.log(r.data)
      setConsultasProduct(r.data)
    } catch (error) {
      console.log(error)
    }
  }

  const getProductById = async (id) => {
    try {
      const r = await getAllProductoByIdService(id)
      console.log(r.data)
      setDataDetalle(r.data)
    } catch (error) {
      console.log(error)
    }
  }

  const createProducto = async (data) => {
    return postCreateProductoService(data, Token)
  }

  const createStockProducto = async (data) => {
    return postCreateStockProductoService(data, data.product_id, Token)
  }

  const createConsultaProducto = async (data) => {
    return postCreateConsultaProductoService(data, data.product_id, TokenClient)
  }

  const updateStockProducto = async (data, id) => {
    return putUpdateStockProductoService(data, id, Token)
  }

  const importProductos = async (data) => {
    return postImportProductoService(data, Token)
  }

  const validateProductoCart = async (id, data) => {
    return postValidateStockProductoService(data, id, Token)
  }
  return {
    data,
    error,
    loading,
    getAllProductos,
    abortController,
    getImagesByProductId,
    ImagesProduct,
    getProductById,
    dataDetalle,
    createProducto,
    createStockProducto,
    StockProduct,
    getStockByProductId,
    updateStockProducto,
    importProductos,
    getAllProductosPagination,
    dataP,
    getAllProductosPublished,
    validateProductoCart,
    getConsultakByProductId,
    ConsultasProduct,
    createConsultaProducto,
    getStocLogsByProductId,
    StockProductLogs,
  }
}
