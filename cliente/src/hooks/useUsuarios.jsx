/* eslint-disable prettier/prettier */

import { useContext, useState } from 'react'
import {
  getAllRoleService,
  getAllUsuariosService,
  patchChangePasswordUsuariosService,
  patchUpdateUsuariosService,
  postCreateRoleService,
  postCreateUsuariosService,
  putChangeRoleService,
} from '../services/usuarios.services'
import AuthContext from '../context/AuthContext'

export const useUsuarios = () => {
  const [data, setData] = useState([])
  const [dataDetalle, setDataDetalle] = useState(null)
  const [DataRole, setDataRole] = useState({
    loading: false,
    data: null,
    error: null,
  })

  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { Token } = useContext(AuthContext)
  const abortController = new AbortController()
  const signal = abortController.signal

  const getAlUsuarios = async () => {
    setLoading(true)
    setData([])
    try {
      const res = await getAllUsuariosService(Token, signal)
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

  const postCreateUsuarios = (data) => {
    return postCreateUsuariosService(Token, data)
  }

  const postCreateRole = (data) => {
    return postCreateRoleService(Token, data)
  }

  const putUpdateRole = (data, id) => {
    return putChangeRoleService(Token, data, id)
  }

  const getAllRole = async (data) => {
    try {
      setDataRole({ loading: true, data: null, error: null })
      const result = await getAllRoleService(Token)
      setDataRole({ loading: false, data: result.data, error: null })
    } catch (error) {
      setDataRole({ loading: false, data: null, error: error.message })
    }
  }

  const patchUpdatedUsuarios = (data, id) => {
    return patchUpdateUsuariosService(Token, data, id)
  }

  const patchChangePasswordUsuarios = (data, id) => {
    return patchChangePasswordUsuariosService(Token, data, id)
  }

  /* const getEventoById = async (id) => {
    try {
      const r = await getAllPuntoVentaByIdService(id)
      console.log(r.data)
      setDataDetalle(r.data)
    } catch (error) {
      console.log(error)
    }
  } */

  return {
    data,
    error,
    loading,
    getAlUsuarios,
    abortController,
    postCreateUsuarios,
    patchChangePasswordUsuarios,
    postCreateRole,
    getAllRole,
    DataRole,
    putUpdateRole,
    patchUpdatedUsuarios
  }
}
