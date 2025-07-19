import React, { Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { CContainer, CSpinner } from '@coreui/react'
import HomeLanding from './pages/HomeLanding'
import ProductDetailPage from './pages/ProductDetailPage'
import LoginProtectedClient from '../../utils/LoginProtectedClient'
import ContactanosPage from '../../views/contactanos/ContactanosPage'

const PuntosVentasPages = React.lazy(() => import('./pages/PuntosVentasPages/PuntosVentasPages'))
const MiProfilePage = React.lazy(() => import('./pages/MiPerfilPage/MiProfilePage'))
const MisComprasPages = React.lazy(() => import('./pages/MisComprasPage/MisComprasPages'))
const ConfirmarCompraPage = React.lazy(
  () => import('./pages/ConfirmarCompraPage/ConfirmarCompraPage'),
)

// routes config

const routes = [
  { path: '/', exact: true, name: 'Home', element: HomeLanding },
  { path: '/eco/:id/producto', exact: true, name: 'Producto Detalle', element: ProductDetailPage },
  {
    path: '/eco/puntos-ventas/',
    exact: true,
    name: 'Producto Detalle',
    element: PuntosVentasPages,
  },
]

const AppContentLanding = () => {
  return (
    <CContainer className="px-4" lg>
      <Suspense fallback={<CSpinner color="primary" />}>
        <Routes>
          <Route
            key={''}
            path={'/contactanos'}
            exact={true}
            name={'Contactanos'}
            element={<ContactanosPage />}
          />
          {routes.map((route, idx) => {
            return (
              route.element && (
                <Route
                  key={idx}
                  path={route.path}
                  exact={route.exact}
                  name={route.name}
                  element={<route.element />}
                />
              )
            )
          })}
          <Route
            key={'mi-perfil'}
            path={'/eco/mi-perfil'}
            exact={true}
            name={'Mi Perfil'}
            element={
              <LoginProtectedClient>
                <MiProfilePage />
              </LoginProtectedClient>
            }
          />
          <Route
            key={'confirmar-compra'}
            path={'/eco/confirmar-compra'}
            exact={true}
            name={'Mi Perfil'}
            element={
              <LoginProtectedClient>
                <ConfirmarCompraPage />
              </LoginProtectedClient>
            }
          />
          <Route
            key={'confirmar-compra'}
            path={'/eco/mis-compras'}
            exact={true}
            name={'Mi Perfil'}
            element={
              <LoginProtectedClient>
                <MisComprasPages />
              </LoginProtectedClient>
            }
          />

          <Route path="/*" element={<>404 PAGE</>} />
        </Routes>
      </Suspense>
    </CContainer>
  )
}

export default React.memo(AppContentLanding)
