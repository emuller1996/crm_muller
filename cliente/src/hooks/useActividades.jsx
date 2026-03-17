/* eslint-disable prettier/prettier */
import { useContext, useState } from 'react'
import AuthContext from '../context/AuthContext'
import {
  deleteActividadService,
  getAllActividadesService,
  postCreateActividadService,
  putUpdateActividadService,
} from '../services/actividades.services'

export const useActividades = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { Token } = useContext(AuthContext)
  const abortController = new AbortController()

  const getAll = async () => {
    setLoading(true)
    try {
      const res = await getAllActividadesService(Token, abortController.signal)
      setData(res.data)
      setError(null)
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }

  const create = async (body) => postCreateActividadService(Token, body)

  const update = async (id, body) => putUpdateActividadService(Token, id, body)

  const remove = async (id) => deleteActividadService(Token, id)

  return { data, loading, error, getAll, create, update, remove }
}
