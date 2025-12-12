/* eslint-disable prettier/prettier */
import React, { useState } from 'react'
import moment from "moment-timezone";
export default function FacturasHoyPage() {
  const currentDate = moment.utc();
  const localDate = currentDate.tz("America/Bogota");

  const [date, setDate] = useState(localDate.format().split("T")[0]);
  
  return (
    <div className="mt-2">
      <div className="row mb-2">
        <div className="col-md-3">
          <input
            value={date}
            onChange={(e) => {
              setDate(e.target.value)
            }}
            className="form-control"
            type="date"
          />
        </div>
      </div>
      <p>lorem</p>
    </div>
  )
}
