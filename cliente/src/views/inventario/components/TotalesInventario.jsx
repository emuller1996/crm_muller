/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from 'react'
import { Badge, Spinner } from 'react-bootstrap'
import PropTypes from 'prop-types'
import { useInventario } from '../../../hooks/useInventario'
import { ViewDollar } from '../../../utils'
import KPICard from '../../metricas/components/KPICard'

/**
 * Tarjetas con los totales del inventario: unidades y valor de la mercancia.
 * Se recarga cada vez que cambia `draw` (por ejemplo, al registrar un movimiento).
 */
export default function TotalesInventario({ draw }) {
  TotalesInventario.propTypes = {
    draw: PropTypes.number,
  }

  const { getTotalesInventario } = useInventario()
  const [totales, setTotales] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const cargar = async () => {
      setLoading(true)
      try {
        const res = await getTotalesInventario()
        setTotales(res.data)
      } catch (error) {
        console.log(error)
        setTotales(null)
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [draw])

  if (loading && !totales) {
    return (
      <div className="d-flex align-items-center gap-2 text-body-secondary mb-3">
        <Spinner size="sm" />
        <span className="small">Calculando totales del inventario...</span>
      </div>
    )
  }

  if (!totales) return null

  const ganancia = totales.ganancia_potencial || 0

  return (
    <div className="mb-3">
      <div className="row g-3">
        <div className="col-12 col-sm-6 col-lg-6 col-xl-3">
          <KPICard
            title="Unidades en stock"
            value={(totales.unidades_totales || 0).toLocaleString('es-CO')}
            subtitle={`${totales.productos_con_stock} productos con stock`}
            icon="fa-solid fa-boxes-stacked"
            color="#3399ff"
          />
        </div>
        <div className="col-12 col-sm-6 col-lg-6 col-xl-3">
          <KPICard
            title="Valor al costo"
            value={ViewDollar(totales.valor_costo || 0)}
            subtitle="Lo invertido en mercancia"
            icon="fa-solid fa-sack-dollar"
            color="#f9b115"
          />
        </div>
        <div className="col-12 col-sm-6 col-lg-6 col-xl-3">
          <KPICard
            title="Valor a precio de venta"
            value={ViewDollar(totales.valor_venta || 0)}
            subtitle="Si se vende todo el stock"
            icon="fa-solid fa-tags"
            color="#6f42c1"
          />
        </div>
        <div className="col-12 col-sm-6 col-lg-6 col-xl-3">
          <KPICard
            title="Ganancia potencial"
            value={ViewDollar(ganancia)}
            subtitle={`Margen ${(totales.margen || 0).toFixed(1)}%`}
            icon="fa-solid fa-chart-line"
            color={ganancia >= 0 ? '#2eb85c' : '#e55353'}
          />
        </div>
      </div>

      <div className="d-flex flex-wrap align-items-center gap-2 mt-2 small">
        <Badge bg="danger">{totales.productos_sin_stock} sin stock</Badge>
        <Badge bg="warning" text="dark">
          {totales.productos_stock_bajo} stock bajo
        </Badge>
        <span className="text-body-secondary">
          {totales.productos_con_stock} de {totales.total_productos} productos con existencias
        </span>
        {loading && <Spinner size="sm" />}
      </div>

      {totales.productos_sin_costo > 0 && (
        <div className="alert alert-warning py-2 small mt-2 mb-0">
          <i className="fa-solid fa-triangle-exclamation me-1"></i>
          {totales.productos_sin_costo} producto(s) con stock no tienen costo registrado; el valor
          al costo y la ganancia potencial pueden no ser exactos.
        </div>
      )}
    </div>
  )
}
