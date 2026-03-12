/* eslint-disable prettier/prettier */
import { Modal, Tab, Tabs } from 'react-bootstrap'
import React from 'react'
import FacturaPage from './facturas/FacturaPage'
import { useState } from 'react'
import FacturasHoyPage from './facturas-hoy/FacturasHoyPage'
import FormFactura from './facturas/components/FormFactura'
import DetalleFactura from './facturas/components/DetalleFactura'
import FormPagosFactura from './facturas/components/FormPagosFactura'

export default function FacturasMainPage(second) {
  const [draw, setDraw] = useState(1)
  const [show, setShow] = useState(false)
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
              onClick={() => {
                setCotiSelecionada(null)
                setShow(true)
              }}
              className="btn btn-primary"
              aria-pressed="false"
            >
              Nueva Factura
            </button>
          </div>
          <Tabs defaultActiveKey="facturas_hoy" id="uncontrolled-tab-example" className="">
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
                setDraw={setDraw}
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
        fullscreen
        centered
        show={show}
        onHide={() => setShow(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Crear Factura</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FormFactura
            getAllFactura={() => {
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
