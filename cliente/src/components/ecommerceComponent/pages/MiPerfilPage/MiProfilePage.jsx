/* eslint-disable prettier/prettier */

import React, { useContext, useEffect } from 'react'
import FormRegister from '../../FormRegister'
import AuthContext from '../../../../context/AuthContext'
import MisDirecciones from './components/MisDirecciones'

export default function MiProfilePage() {
  useEffect(() => {
    console.log('raro')
  }, [])
  const { client } = useContext(AuthContext)

  return (
    <div className="container mt-5">
      <p className="text-center fs-4">Mi Perfil</p>
      <p className="text-center text-muted">
        Hola {client?.name_client}, Bienvenido a la esa sesión para que puedes gestionar la información personal de ti, para poder comunicarte contigo para poder atenderte mejor.
      </p>
      <div>{client && <FormRegister client={client} />}</div>
      <MisDirecciones />
    </div>
  )
}
