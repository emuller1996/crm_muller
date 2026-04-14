import React from 'react'

const EntregasPages = React.lazy(() => import('./views/entregas-pedidos/EntregasPages'))
const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const UsuariosPage = React.lazy(() => import('./views/usuarios/UsuariosPage'))
const ProductosPage = React.lazy(() => import('./views/productos/Productos'))
const CategoriasPage = React.lazy(() => import('./views/categorias/Categorias'))
const ImagesPage = React.lazy(() => import('./views/productos/ImagesPage/ImagesPage'))
const ClientePage = React.lazy(() => import('./views/clientes/ClientePage'))
const TallasPage = React.lazy(() => import('./views/productos/TallasPage/TallasPage'))
const EmpresaPage = React.lazy(() => import('./views/empresa/EmpresaPage'))
const FacturasMainPage = React.lazy(() => import('./views/facturas'))
const CotizacionPage = React.lazy(() => import('./views/cotizaciones/CotizacionPage'))
const RolesPage = React.lazy(() => import('./views/usuarios/pages/RolesPage'))
const ActividadesPage = React.lazy(() => import('./views/actividades/ActividadesPage'))
const ProveedoresPage = React.lazy(() => import('./views/proveedores/ProveedoresPage'))
const CajaPage = React.lazy(() => import('./views/caja/CajaPage'))
const FacturasCompraMainPage = React.lazy(() => import('./views/facturas-compra'))
const InventarioPage = React.lazy(() => import('./views/inventario/InventarioPage'))
const LogsPage = React.lazy(() => import('./views/logs/LogsPage'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/usuarios', name: 'Usuarios', element: UsuariosPage },
  { path: '/usuarios/roles', name: 'Roles', element: RolesPage },
  { path: '/productos', name: 'Productos', element: ProductosPage },
  { path: '/categorias', name: 'Categorias', element: CategoriasPage },
  { path: '/clientes', name: 'Clientes', element: ClientePage },
  { path: '/facturas', name: 'Facturas', element: FacturasMainPage },
  { path: '/cotizaciones', name: 'Cotizaciones', element: CotizacionPage },
  { path: '/empresa', name: 'Empresa Config', element: EmpresaPage },
  { path: '/pedidos', name: 'Entregas - Pedidos', element: EntregasPages },
  { path: '/actividades', name: 'Actividades', element: ActividadesPage },
  { path: '/proveedores', name: 'Proveedores', element: ProveedoresPage },
  { path: '/caja', name: 'Movimiento de Caja', element: CajaPage },
  { path: '/facturas-compra', name: 'Facturas de Compra', element: FacturasCompraMainPage },
  { path: '/inventario', name: 'Inventario', element: InventarioPage },
  { path: '/logs', name: 'Logs', element: LogsPage },
  { path: '/productos/:idProduct/images', name: 'ImagesPage', element: ImagesPage },
  { path: '/productos/:idProduct/gestion-tallas', name: 'ImagesPage', element: TallasPage },
]

export default routes
