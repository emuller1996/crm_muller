import React from 'react'
import FacturasMainPage from './views/facturas'

const EntregasPages = React.lazy(() => import('./views/entregas-pedidos/EntregasPages'))
const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const UsuariosPage = React.lazy(() => import('./views/usuarios/UsuariosPage'))
const ProductosPage = React.lazy(() => import('./views/productos/Productos'))
const CategoriasPage = React.lazy(() => import('./views/categorias/Categorias'))
const ImagesPage = React.lazy(() => import('./views/productos/ImagesPage/ImagesPage'))
const ClientePage = React.lazy(() => import('./views/clientes/ClientePage'))
const TallasPage = React.lazy(() => import('./views/productos/TallasPage/TallasPage'))
const EmpresaPage = React.lazy(() => import('./views/empresa/EmpresaPage'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/usuarios', name: 'Usuarios', element: UsuariosPage },
  { path: '/productos', name: 'Productos', element: ProductosPage },
  { path: '/categorias', name: 'Categorias', element: CategoriasPage },
  { path: '/clientes', name: 'Clientes', element: ClientePage },
  { path: '/facturas', name: 'Facturas', element: FacturasMainPage },
  { path: '/empresa', name: 'Empresa Config', element: EmpresaPage },
  { path: '/pedidos', name: 'Entregas - Pedidos', element: EntregasPages },
  { path: '/productos/:idProduct/images', name: 'ImagesPage', element: ImagesPage },
  { path: '/productos/:idProduct/gestion-tallas', name: 'ImagesPage', element: TallasPage },
]

export default routes
