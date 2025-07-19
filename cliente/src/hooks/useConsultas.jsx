/* eslint-disable prettier/prettier */

import { useContext, useState } from 'react'
import AuthContext from '../context/AuthContext'
import {
  getConsultasPaginationServices,
  getRespuestaByConsultaServices,
  postCreateRespuestaByConsultaServices,
  putUpdateConsultasByIdServices,
} from '../services/consultas.services'

export const useConsultas = () => {
  const { Token } = useContext(AuthContext)

  const [dataP, setDataP] = useState(undefined)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const abortController = new AbortController()
  const signal = abortController.signal

  const getAllConsultasPagination = async (data) => {
    setLoading(true)
    setDataP(undefined)
    try {
      const res = await getConsultasPaginationServices(Token, data)
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
        setDataP(null)
        setError(error)
      }
    } finally {
      if (!signal.aborted) {
        setLoading(false)
      }
    }
  }

  const changeStatusConsultas = async (id, data) => {
    return putUpdateConsultasByIdServices(Token, data, id)
  }


  const postCreateRespuesta = async(data) =>{
    return postCreateRespuestaByConsultaServices(Token,data)
  }

  const getRespuestaByConsulta = async(id) =>{
    return getRespuestaByConsultaServices(Token,id)
  }

  return {
    getAllConsultasPagination,
    dataP,
    error,
    loading,
    changeStatusConsultas,
    postCreateRespuesta,
    getRespuestaByConsulta
  }
}
