/* eslint-disable prettier/prettier */

import { useContext, useState } from 'react'
import { getAllCategoriasService, postCreateCategoriaService, putUpdateCategoriaService } from '../services/categorias.services'
import AuthContext from '../context/AuthContext'

export const useCategorias = () => {
  const [data, setData] = useState(null)
  const [dataDetalle, setDataDetalle] = useState(null)

  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const abortController = new AbortController()
  const signal = abortController.signal
  const { Token } = useContext(AuthContext)


  const getAllCategorias = async () => {
    setLoading(true)
    try {
      const res = await getAllCategoriasService(Token,signal)
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

  const crearCategoria = async (data) => {
    return postCreateCategoriaService(Token,data)
  }

  const actualizarCategoria = async (data,id) => {
    return putUpdateCategoriaService(Token,id,data)
  }

  return {
    data,
    error,
    loading,
    getAllCategorias,
    abortController,
    crearCategoria,
    actualizarCategoria
  }
}
