/* eslint-disable prettier/prettier */
import React from 'react'
import { CContainer } from '@coreui/react'
import { Tab, Tabs } from 'react-bootstrap'
import VentasTab from './tabs/VentasTab'
import ComprasTab from './tabs/ComprasTab'
import ProductosTab from './tabs/ProductosTab'
import ClientesTab from './tabs/ClientesTab'
import ProveedoresTab from './tabs/ProveedoresTab'

export default function MetricasPage() {
  return (
    <CContainer fluid>
      <div className="mb-3">
        <h4 className="fw-bold mb-0">
          <i className="fa-solid fa-chart-line me-2 text-primary"></i>
          Metricas Detalladas
        </h4>
        <small className="text-muted">
          Analisis filtrable de ventas, compras, productos, clientes y proveedores
        </small>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <Tabs defaultActiveKey="ventas" id="metricas-tabs" className="mb-3">
            <Tab eventKey="ventas" title={<><i className="fa-solid fa-cash-register me-1"></i>Ventas</>}>
              <VentasTab />
            </Tab>
            <Tab eventKey="compras" title={<><i className="fa-solid fa-truck-ramp-box me-1"></i>Compras</>}>
              <ComprasTab />
            </Tab>
            <Tab eventKey="productos" title={<><i className="fa-solid fa-box me-1"></i>Productos</>}>
              <ProductosTab />
            </Tab>
            <Tab eventKey="clientes" title={<><i className="fa-solid fa-users me-1"></i>Clientes</>}>
              <ClientesTab />
            </Tab>
            <Tab eventKey="proveedores" title={<><i className="fa-solid fa-truck-field me-1"></i>Proveedores</>}>
              <ProveedoresTab />
            </Tab>
          </Tabs>
        </div>
      </div>
    </CContainer>
  )
}
