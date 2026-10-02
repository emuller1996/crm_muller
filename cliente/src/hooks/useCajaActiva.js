/* eslint-disable prettier/prettier */

import { useCallback, useEffect, useState } from 'react'

// Caja activa compartida entre facturas y movimientos de caja
const STORAGE_KEY = 'caja_factura_venta'
const EVENT_NAME = 'caja-activa-change'

const readCaja = () => {
  try {
    const item = window.localStorage.getItem(STORAGE_KEY)
    return item ? JSON.parse(item) : null
  } catch (error) {
    return null
  }
}

export function useCajaActiva() {
  const [cajaId, setCajaIdState] = useState(readCaja)

  useEffect(() => {
    const onCustom = (e) => setCajaIdState(e.detail ?? null)
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) setCajaIdState(readCaja())
    }
    window.addEventListener(EVENT_NAME, onCustom)
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener(EVENT_NAME, onCustom)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  const setCajaId = useCallback((id) => {
    const value = id ?? null
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    } catch (error) {
      console.error(error)
    }
    setCajaIdState(value)
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: value }))
  }, [])

  return [cajaId, setCajaId]
}
