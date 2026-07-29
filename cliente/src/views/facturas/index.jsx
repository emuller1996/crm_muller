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
  const [ticketAncho, setTicketAncho] = useState(
    Number(localStorage.getItem('ticket_ancho_mm')) || 80,
  )

  const handleAnchoChange = (value) => {
    setTicketAncho(value)
    localStorage.setItem('ticket_ancho_mm', String(value))
  }

  return (
    <>
      <div className="card">
        <div className="card-body">
          <div className="my-2 d-flex align-items-center justify-content-between flex-wrap gap-2">
            <button
              type="button"
              onClick={() => navigate('/facturas/nueva')}
              className="btn btn-primary"
              aria-pressed="false"
            >
              <i className="fa-solid fa-plus me-1"></i>
              Nueva Factura
            </button>
            <div className="d-flex align-items-center gap-2">
              <span className="small text-muted">
                <i className="fa-solid fa-receipt me-1"></i>
                Ancho ticket:
              </span>
              <div className="btn-group btn-group-sm" role="group" aria-label="Ancho de ticket">
                {[58, 80].map((mm) => (
                  <button
                    key={mm}
                    type="button"
                    className={`btn ${ticketAncho === mm ? 'btn-dark' : 'btn-outline-dark'}`}
                    onClick={() => handleAnchoChange(mm)}
                  >
                    {mm}mm
                  </button>
                ))}
              </div>
            </div>
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
