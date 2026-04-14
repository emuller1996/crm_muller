/* eslint-disable prettier/prettier */
import axios from 'axios'

const headers = (token) => ({ headers: { 'access-token': token } })

export const getLogsPaginationService = async (token, ...params) => {
  const searchs = new URLSearchParams()

  Object.entries(params[0]).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchs.append(key, value)
    }
  })

  return await axios.get(`/logs?${searchs.toString()}`, headers(token))
}

export const getLogByIdService = (token, id) => {
  return axios.get(`/logs/${id}`, headers(token))
}

export const getLogsStatsService = (token) => {
  return axios.get('/logs/stats', headers(token))
}
