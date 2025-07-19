/* eslint-disable prettier/prettier */
import axios from 'axios'


export const getConsultasPaginationServices = async (token, ...params) => {
  const searchs = new URLSearchParams()

  Object.entries(params[0]).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchs.append(key, value)
    }
  })

  return await axios.get(`/consultas/pagination/?${searchs.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export const putUpdateConsultasByIdServices = async (token, data,id) => {
  return await axios.put(`/consultas/${id}`,data ,{
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export const postCreateRespuestaByConsultaServices = async (token, data) => {
  return await axios.post(`/consultas/respuesta`,data ,{
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export const getRespuestaByConsultaServices = async (token, id) => {
  return await axios.get(`/consultas/${id}/respuesta`,{
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}
