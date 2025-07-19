/* eslint-disable prettier/prettier */
import { Tab, Tabs } from 'react-bootstrap'
import React from 'react'
import CotizacionPage from './cotizaciones/CotizacionPage'

export default function FacturasMainPage(second) {
  return (
    <>
      <div className="card">
        <div className="card-body">
          <Tabs defaultActiveKey="profile" id="uncontrolled-tab-example" className="">
            <Tab eventKey="Facturas" title="Facturas">
              Tab content for Home
            </Tab>
            <Tab eventKey="cotizacion" title="Cotización">
              <CotizacionPage />
            </Tab>
          </Tabs>
        </div>
      </div>
      <p>FacturasMainPage</p>
    </>
  )
}
