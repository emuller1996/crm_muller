/* eslint-disable prettier/prettier */
import { Tab, Tabs } from 'react-bootstrap'
import React from 'react'
import FacturaPage from './facturas/FacturaPage'
import { useState } from 'react'

export default function FacturasMainPage(second) {

  const [draw, setDraw] = useState(1)

  return (
    <>
      <div className="card">
        <div className="card-body">
          <Tabs defaultActiveKey="Facturas" id="uncontrolled-tab-example" className="">
            <Tab eventKey="Facturas" title="Facturas">
              <FacturaPage  draw={draw} setDraw={setDraw} />
            </Tab>
            <Tab eventKey="cotizacion" title="Cotización">
            </Tab>
          </Tabs>
        </div>
      </div>
    </>
  )
}
