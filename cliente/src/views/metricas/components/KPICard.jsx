/* eslint-disable prettier/prettier */
import React from 'react'
import { CCard, CCardBody } from '@coreui/react'
import PropTypes from 'prop-types'

export default function KPICard({ title, value, subtitle, icon, color }) {
  return (
    <CCard className="h-100 border-0 shadow-sm">
      <CCardBody>
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <div className="text-muted small text-uppercase fw-semibold">{title}</div>
            <div className="fs-4 fw-bold mt-1">{value}</div>
            {subtitle && (
              <div className="text-muted small mt-1">{subtitle}</div>
            )}
          </div>
          {icon && (
            <div
              className="d-flex align-items-center justify-content-center"
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                backgroundColor: `${color}1A`,
              }}
            >
              <i className={icon} style={{ fontSize: 20, color }}></i>
            </div>
          )}
        </div>
      </CCardBody>
    </CCard>
  )
}

KPICard.propTypes = {
  title: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  subtitle: PropTypes.string,
  icon: PropTypes.string,
  color: PropTypes.string,
}
