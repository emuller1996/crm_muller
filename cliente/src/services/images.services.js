/* eslint-disable prettier/prettier */

import axios from 'axios'

export const getImageByidService = (id) => {
  return axios.get(`/images/${id}`)
}


