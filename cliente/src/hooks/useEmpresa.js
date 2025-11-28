import { useContext } from 'react'
import { getEmpresaService, postEstablecerEmpresaService } from '../services/empresa.services'
import AuthContext from '../context/AuthContext'
import { useState } from 'react'

export const useEmpresa = () => {
  const { Token } = useContext(AuthContext)

  const [empresaData, setEmpresaData] = useState(null)

  const getConfiguracionEmpresa = async (data) => {
    try {
      const result = await getEmpresaService(Token)
      setEmpresaData(result.data)
    } catch (error) {
      console.log(error)
      setEmpresaData(null)
    } finally {

    }
  }

  const establecerConfiguracionEmpresa = async (data) => {
    return postEstablecerEmpresaService(Token, data)
  }

  return {
    establecerConfiguracionEmpresa,
    getConfiguracionEmpresa,
    empresaData
  }
}
