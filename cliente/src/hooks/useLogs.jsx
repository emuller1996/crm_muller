/* eslint-disable prettier/prettier */
import { useContext, useState } from 'react'
import AuthContext from '../context/AuthContext'
import {
  getLogsPaginationService,
  getLogByIdService,
  getLogsStatsService,
} from '../services/logs.services'

export const useLogs = () => {
  const { Token } = useContext(AuthContext)
  const [data, setData] = useState(undefined)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)

  const getLogs = async (params) => {
    setLoading(true)
    setData(undefined)
    try {
      const res = await getLogsPaginationService(Token, params)
      setData(res.data)
    } catch (error) {
      console.log(error)
      setData(undefined)
    } finally {
      setLoading(false)
    }
  }

  const getLogById = async (id) => {
    return getLogByIdService(Token, id)
  }

  const getStats = async () => {
    try {
      const res = await getLogsStatsService(Token)
      setStats(res.data)
    } catch (error) {
      console.log(error)
    }
  }

  return {
    data,
    stats,
    loading,
    getLogs,
    getLogById,
    getStats,
  }
}
