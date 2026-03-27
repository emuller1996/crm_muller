/* eslint-disable prettier/prettier */
import { Modal, Tab, Tabs } from 'react-bootstrap'
import React from 'react'
import FacturaCompraPage from './facturas/FacturaCompraPage'
import { useState } from 'react'
import FacturasCompraHoyPage from './facturas-hoy/FacturasCompraHoyPage'
import FormFacturaCompra from './facturas/components/FormFacturaCompra'
import DetalleFacturaCompra from './facturas/components/DetalleFacturaCompra'
import FormPagosFacturaCompra from './facturas/components/FormPagosFacturaCompra'

export default function FacturasCompraMainPage() {
  const [draw, setDraw] = useState(1)
  const [show, setShow] = useState(false)
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
              onClick={() => {
                setFacturaSelecionada(null)
                setShow(true)
              }}
              className="btn btn-primary"
              aria-pressed="false"
            >
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
        fullscreen
        centered
        show={show}
        onHide={() => setShow(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Crear Factura de Compra</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FormFacturaCompra
            getAllFacturaCompra={() => {
              setShow(false)
              setDraw((status) => ++status)
            }}
          />
        </Modal.Body>
      </Modal>
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
