/* eslint-disable prettier/prettier */
import { Modal, Tab, Tabs } from 'react-bootstrap'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FacturaPage from './facturas/FacturaPage'
import FacturasHoyPage from './facturas-hoy/FacturasHoyPage'
import DetalleFactura from './facturas/components/DetalleFactura'
import FormPagosFactura from './facturas/components/FormPagosFactura'

export default function FacturasMainPage() {
  const navigate = useNavigate()
  const [draw] = useState(1)
  const [showView, setShowView] = useState(false)
  const [showPago, setShowPago] = useState(false)
  const [CotiSelecionada, setCotiSelecionada] = useState(null)

  return (
    <>
      <div className="card">
        <div className="card-body">
          <div className="my-2">
            <button
              type="button"
              onClick={() => navigate('/facturas/nueva')}
              className="btn btn-primary"
              aria-pressed="false"
            >
              <i className="fa-solid fa-plus me-1"></i>
              Nueva Factura
            </button>
          </div>
          <Tabs defaultActiveKey="facturas_hoy" id="uncontrolled-tab-example">
            <Tab eventKey="facturas_hoy" title="Facturas de Hoy">
              <FacturasHoyPage
                draw={draw}
                onViewFactura={(factura) => {
                  setCotiSelecionada(factura)
                  setShowView(true)
                }}
                onPayment={(factura) => {
                  setShowPago(true)
                  setCotiSelecionada(factura)
                }}
              />
            </Tab>
            <Tab eventKey="Facturas" title="Facturas">
              <FacturaPage
                draw={draw}
                onViewFactura={(factura) => {
                  setCotiSelecionada(factura)
                  setShowView(true)
                }}
                onPayment={(factura) => {
                  setShowPago(true)
                  setCotiSelecionada(factura)
                }}
              />
            </Tab>
          </Tabs>
        </div>
      </div>

      <Modal
        backdrop={'static'}
        size="xl"
        centered
        show={showView}
        onHide={() => setShowView(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Detalle Factura</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <DetalleFactura Factura={CotiSelecionada} />
        </Modal.Body>
      </Modal>
      <Modal
        backdrop={'static'}
        size="xl"
        centered
        show={showPago}
        onHide={() => setShowPago(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Pagos de Factura</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FormPagosFactura Factura={CotiSelecionada} />
        </Modal.Body>
      </Modal>
    </>
  )
}
