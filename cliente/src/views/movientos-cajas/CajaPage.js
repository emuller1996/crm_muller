import React, { useState } from 'react'
import { CContainer } from '@coreui/react'
import { Button, Modal, Tab, Tabs } from 'react-bootstrap'
import FormMovimiento from './components/FormMovimiento'
import MovimientosDiaPage from './components/MovimientosDiaPage'
import MovimientosRangoPage from './components/MovimientosRangoPage'

const CajaPage = () => {
  const [show, setShow] = useState(false)
  const [draw, setDraw] = useState(1)

  return (
    <div className="">
      <CContainer fluid>
        <div className="card">
          <div className="card-body">
            <div className="my-2">
              <Button variant="success" className="text-white" onClick={() => setShow(true)}>
                <i className="fa-solid fa-plus me-1"></i>
                Registrar Movimiento
              </Button>
            </div>
            <Tabs defaultActiveKey="caja_dia" id="caja-tabs">
              <Tab eventKey="caja_dia" title="Movimientos del Dia">
                <MovimientosDiaPage draw={draw} />
              </Tab>
              <Tab eventKey="caja_rango" title="Movimientos por Rango">
                <MovimientosRangoPage draw={draw} />
              </Tab>
            </Tabs>
          </div>
        </div>

        <Modal backdrop={'static'} size="lg" centered show={show} onHide={() => setShow(false)}>
          <Modal.Body>
            <FormMovimiento onHide={() => setShow(false)} onSuccess={() => setDraw((s) => ++s)} />
          </Modal.Body>
        </Modal>
      </CContainer>
    </div>
  )
}

export default CajaPage
