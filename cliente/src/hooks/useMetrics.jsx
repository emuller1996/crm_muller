/* eslint-disable prettier/prettier */
import { useContext, useState } from 'react'
import AuthContext from '../context/AuthContext'
import {
  getKPIsService,
  getVentasPorDiaService,
  getTopProductosService,
  getVentasPorMetodoPagoService,
  getTopClientesService,
  getStockBajoService,
  getCajaHoyService,
} from '../services/metrics.services'

export const useMetrics = () => {
  const { Token } = useContext(AuthContext)

  const [kpis, setKpis] = useState(null)
  const [ventasPorDia, setVentasPorDia] = useState([])
  const [topProductos, setTopProductos] = useState([])
  const [ventasPorMetodo, setVentasPorMetodo] = useState([])
  const [topClientes, setTopClientes] = useState([])
  const [stockBajo, setStockBajo] = useState([])
  const [cajaHoy, setCajaHoy] = useState(null)
  const [loading, setLoading] = useState(false)

  const loadAll = async () => {
    setLoading(true)
    try {
      const [rKpis, rDia, rProds, rMetodo, rClientes, rStock, rCaja] = await Promise.all([
        getKPIsService(Token),
        getVentasPorDiaService(Token, 7),
        getTopProductosService(Token, 5),
        getVentasPorMetodoPagoService(Token),
        getTopClientesService(Token, 5),
        getStockBajoService(Token, 10),
        getCajaHoyService(Token),
      ])
      setKpis(rKpis.data)
      setVentasPorDia(rDia.data)
      setTopProductos(rProds.data)
      setVentasPorMetodo(rMetodo.data)
      setTopClientes(rClientes.data)
      setStockBajo(rStock.data)
      setCajaHoy(rCaja.data)
    } catch (error) {
      console.log('Error cargando metricas:', error)
    } finally {
      setLoading(false)
    }
  }

  return {
    kpis,
    ventasPorDia,
    topProductos,
    ventasPorMetodo,
    topClientes,
    stockBajo,
    cajaHoy,
    loading,
    loadAll,
  }
}
