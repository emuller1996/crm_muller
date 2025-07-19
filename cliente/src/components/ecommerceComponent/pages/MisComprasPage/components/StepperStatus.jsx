/* eslint-disable prettier/prettier */
import { Step, StepLabel, Stepper } from '@mui/material'
import React from 'react'
import PropTypes from 'prop-types'

export default function StepperStatus({ status }) {
  StepperStatus.propTypes = {
    status: PropTypes.string,
  }
  const steps = ['Pendiente', 'En Proceso', 'En Camino', 'Entregado']

  let testAc = 0

  if (status === 'Pendiente') {
    testAc = 0
  }
  if (status === 'En Proceso') {
    testAc = 1
  }
  if (status === 'En Camino') {
    testAc = 2
  }
  if (status === 'Entregada') {
    testAc = 4
  }

  return (
    <div className="mb-3 pb-3" style={{ borderBottom: '1px solid #dbdbdb' }}>
      <p className="text-center text-muted">Estado de tu Pedido</p>
      <Stepper activeStep={testAc} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </div>
  )
}
