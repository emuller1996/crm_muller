import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilBell,
  cilCalculator,
  cilChartPie,
  cilCursor,
  cilDescription,
  cilDrop,
  cilNotes,
  cilPencil,
  cilPuzzle,
  cilSpeedometer,
  cilStar,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    badge: {
      color: 'info',
      text: 'NEW',
    },
  },
  {
    component: CNavTitle,
    name: 'Gestion de Productos',
  },
  {
    component: CNavItem,
    name: 'Productos',
    to: '/productos',
    icon: <i className="fa-solid fa-box nav-icon"></i>,
  },
  {
    component: CNavItem,
    name: 'Categorias',
    to: '/categorias',
    icon: <i className="fa-solid fa-list nav-icon"></i>,
  },
  {
    component: CNavTitle,
    name: 'Tabla de Control',
  },
  {
    component: CNavItem,
    name: 'Facturas / Cotizaciones',
    to: '/facturas',
    icon: <i style={{ width: '30px' }} className="fa-solid fa-receipt nav-icon"></i>,
  },
  {
    component: CNavItem,
    name: 'Entregas / Pedidos',
    to: '/pedidos',
    icon: <i style={{ width: '30px' }} className="fa-solid fa-truck-ramp-box nav-icon"></i>,
  },
  {
    component: CNavItem,
    name: 'Clientes',
    to: '/clientes',
    icon: <i className="fa-solid fa-users  nav-icon"></i>,
  },
  {
    component: CNavTitle,
    name: 'Configuraciones',
  },
  {
    component: CNavItem,
    name: 'Usuarios',
    to: '/usuarios',
    icon: <i style={{ width: '30px' }} className="fa-solid fa-users nav-icon"></i>,
  },
  {
    component: CNavItem,
    name: 'Rep. de Ventas',
    to: '/representantes-venta',

    icon: <i className="fa-solid fa-people-line nav-icon"></i>,
  },
  {
    component: CNavItem,
    name: 'Puntos de Venta',
    to: '/puntos-venta',

    icon: <i className="fa-solid fa-shop nav-icon"></i>,
  },
  {
    component: CNavItem,
    name: 'LOGS',
    to: '/logs',
    icon: <i className="fa-solid fa-terminal nav-icon"></i>,
  },
]

export default _nav
