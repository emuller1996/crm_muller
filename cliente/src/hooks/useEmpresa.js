import { useContext } from 'react'
import {
  getEmpresaService,
  postEstablecerEmpresaService,
  putActualizarEmpresaService,
} from '../services/empresa.services'
import AuthContext from '../context/AuthContext'
import { useState } from 'react'

export const useEmpresa = () => {
  const { Token } = useContext(AuthContext)

  const [empresaData, setEmpresaData] = useState(null)

  const getConfiguracionEmpresa = async () => {
    try {
      const result = await getEmpresaService(Token)
      setEmpresaData(result.data)
    } catch (error) {
      console.log(error)
      setEmpresaData(null)
    }
  }

  const establecerConfiguracionEmpresa = async (data) => {
    return postEstablecerEmpresaService(Token, data)
  }

  const actualizarEmpresa = async (data) => {
    return putActualizarEmpresaService(Token, data)
  }

  return {
    establecerConfiguracionEmpresa,
    getConfiguracionEmpresa,
    actualizarEmpresa,
    empresaData,
  }
}
