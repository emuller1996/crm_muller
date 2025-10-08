/* eslint-disable prettier/prettier */

import { useContext, useState } from 'react'
import AuthContext from '../context/AuthContext'
import { getAllPedidosService, postCreatePedidosService, putUpdatePedidosService } from '../services/pedidos.services'

export const usePedidos = () => {
  const [data, setData] = useState(null)
  const [dataDetalle, setDataDetalle] = useState(null)

  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const abortController = new AbortController()
  const signal = abortController.signal
  const { Token } = useContext(AuthContext)


  const getAllPedidos = async () => {
    setLoading(true)
    try {
      const res = await getAllPedidosService(Token,signal)
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

  const crearPedidos = async (data) => {
    return postCreatePedidosService(Token,data)
  }

  const actualizarPedidos = async (data,id) => {
    return putUpdatePedidosService(Token,id,data)
  }

  return {
    data,
    error,
    loading,
    getAllPedidos,
    abortController,
    crearPedidos,
    actualizarPedidos
  }
}
