/* eslint-disable prettier/prettier */
import { useContext, useState } from 'react'
import AuthContext from '../context/AuthContext'
import {
  getMetricasVentasService,
  getMetricasComprasService,
  getMetricasProductosService,
  getMetricasClientesService,
  getMetricasProveedoresService,
} from '../services/metrics.services'

/**
 * Hook con state y loaders separados por tab.
 * Cambiar de tab no pierde datos (cada uno tiene su propio state + loading).
 */
export const useMetricasDetalle = () => {
  const { Token } = useContext(AuthContext)

  const [ventas, setVentas] = useState(null)
  const [loadingVentas, setLoadingVentas] = useState(false)

  const [compras, setCompras] = useState(null)
  const [loadingCompras, setLoadingCompras] = useState(false)

  const [productos, setProductos] = useState(null)
  const [loadingProductos, setLoadingProductos] = useState(false)

  const [clientes, setClientes] = useState(null)
  const [loadingClientes, setLoadingClientes] = useState(false)

  const [proveedores, setProveedores] = useState(null)
  const [loadingProveedores, setLoadingProveedores] = useState(false)

  const loadVentas = async (params) => {
    setLoadingVentas(true)
    try {
      const res = await getMetricasVentasService(Token, params)
      setVentas(res.data)
    } catch (error) {
      console.log('Error metricas ventas:', error)
      setVentas(null)
    } finally {
      setLoadingVentas(false)
    }
  }

  const loadCompras = async (params) => {
    setLoadingCompras(true)
    try {
      const res = await getMetricasComprasService(Token, params)
      setCompras(res.data)
    } catch (error) {
      console.log('Error metricas compras:', error)
      setCompras(null)
    } finally {
      setLoadingCompras(false)
    }
  }

  const loadProductos = async (params) => {
    setLoadingProductos(true)
    try {
      const res = await getMetricasProductosService(Token, params)
      setProductos(res.data)
    } catch (error) {
      console.log('Error metricas productos:', error)
      setProductos(null)
    } finally {
      setLoadingProductos(false)
    }
  }

  const loadClientes = async (params) => {
    setLoadingClientes(true)
    try {
      const res = await getMetricasClientesService(Token, params)
      setClientes(res.data)
    } catch (error) {
      console.log('Error metricas clientes:', error)
      setClientes(null)
    } finally {
      setLoadingClientes(false)
    }
  }

  const loadProveedores = async (params) => {
    setLoadingProveedores(true)
    try {
      const res = await getMetricasProveedoresService(Token, params)
      setProveedores(res.data)
    } catch (error) {
      console.log('Error metricas proveedores:', error)
      setProveedores(null)
    } finally {
      setLoadingProveedores(false)
    }
  }

  return {
    ventas,
    loadingVentas,
    loadVentas,
    compras,
    loadingCompras,
    loadCompras,
    productos,
    loadingProductos,
    loadProductos,
    clientes,
    loadingClientes,
    loadClientes,
    proveedores,
    loadingProveedores,
    loadProveedores,
  }
}
