/* eslint-disable prettier/prettier */
import { Tab, Tabs } from 'react-bootstrap'
import React from 'react'
import CotizacionPage from './cotizaciones/CotizacionPage'
import FacturaPage from './facturas/FacturaPage'

export default function FacturasMainPage(second) {
  return (
    <>
      <div className="card">
        <div className="card-body">
          <Tabs defaultActiveKey="Facturas" id="uncontrolled-tab-example" className="">
            <Tab eventKey="Facturas" title="Facturas">
              <FacturaPage />
            </Tab>
            <Tab eventKey="cotizacion" title="Cotización">
              <CotizacionPage />
            </Tab>
          </Tabs>
        </div>
      </div>
    </>
  )
}
