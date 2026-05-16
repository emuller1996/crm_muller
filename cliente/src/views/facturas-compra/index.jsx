/* eslint-disable prettier/prettier */
import { Modal, Tab, Tabs } from 'react-bootstrap'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FacturaCompraPage from './facturas/FacturaCompraPage'
import FacturasCompraHoyPage from './facturas-hoy/FacturasCompraHoyPage'
import DetalleFacturaCompra from './facturas/components/DetalleFacturaCompra'
import FormPagosFacturaCompra from './facturas/components/FormPagosFacturaCompra'

export default function FacturasCompraMainPage() {
  const navigate = useNavigate()
  const [draw, setDraw] = useState(1)
  const [showView, setShowView] = useState(false)
  const [showPago, setShowPago] = useState(false)
  const [FacturaSelecionada, setFacturaSelecionada] = useState(null)

  return (
    <>
      <div className="card">
        <div className="card-body">
          <div className="my-2">
            <button
              type="button"
              onClick={() => navigate('/facturas-compra/nueva')}
              className="btn btn-primary"
              aria-pressed="false"
            >
              <i className="fa-solid fa-plus me-1"></i>
              Nueva Factura de Compra
            </button>
          </div>
          <Tabs defaultActiveKey="facturas_compra_hoy" id="tab-facturas-compra" className="">
            <Tab eventKey="facturas_compra_hoy" title="Facturas de Hoy">
              <FacturasCompraHoyPage
                draw={draw}
                onViewFactura={(factura) => {
                  setFacturaSelecionada(factura)
                  setShowView(true)
                }}
                onPayment={(factura) => {
                  setShowPago(true)
                  setFacturaSelecionada(factura)
                }}
              />
            </Tab>
            <Tab eventKey="FacturasCompra" title="Facturas de Compra">
              <FacturaCompraPage
                draw={draw}
                setDraw={setDraw}
                onViewFactura={(factura) => {
                  setFacturaSelecionada(factura)
                  setShowView(true)
                }}
                onPayment={(factura) => {
                  setShowPago(true)
                  setFacturaSelecionada(factura)
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
          <Modal.Title>Detalle Factura de Compra</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <DetalleFacturaCompra Factura={FacturaSelecionada} />
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
          <Modal.Title>Pagos de Factura de Compra</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FormPagosFacturaCompra Factura={FacturaSelecionada} />
        </Modal.Body>
      </Modal>
    </>
  )
}
