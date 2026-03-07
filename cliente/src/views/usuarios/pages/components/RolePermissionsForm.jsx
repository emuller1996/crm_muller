/* eslint-disable prettier/prettier */
import React from 'react'
import { useForm } from 'react-hook-form'
import { ACL_APP } from '../../../../utils/ACL'
import { useUsuarios } from '../../../../hooks/useUsuarios'
import toast from 'react-hot-toast'
import PropTypes from 'prop-types'
import { useEffect } from 'react'

export default function RolePermissionsForm({ onHide, allRole, role }) {
  RolePermissionsForm.propTypes = {
    onHide: PropTypes.func,
    allRole: PropTypes.func,
    role: PropTypes.object,
  }
  const { register, handleSubmit, reset } = useForm()

  const { postCreateRole, putUpdateRole } = useUsuarios()

  useEffect(() => {
    if (role) {
      reset({
        name: role.name,
        permissions:
          typeof role.permissions === 'string' ? JSON.parse(role.permissions) : role.permissions,
      })
    }
  }, [role, reset])

  const onSubmit = async (data) => {
    console.log(data)
    const payload = {
      name: data.name,
      permissions: JSON.stringify(data.permissions),
    }
    console.log('Enviar al backend:', payload)
    if (role) {
      try {
        const result = await putUpdateRole(payload,role._id)
        console.log(result.data)
        toast.success(result.data.message)
        onHide()
        allRole()
      } catch (error) {
        console.log(error)
      }
    } else {
      try {
        const result = await postCreateRole(payload)
        console.log(result.data)
        toast.success(result.data.message)
        onHide()
        allRole()
      } catch (error) {
        console.log(error)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* NOMBRE DEL ROL */}

      <div className="mb-4">
        <label className="form-label fw-bold">Nombre del rol</label>

        <input
          className="form-control"
          placeholder="Ej: Administrador"
          {...register('name', { required: true })}
        />
      </div>

      {/* PERMISOS */}

      <div className="row g-3">
        {Object.entries(ACL_APP.modules).map(([moduleKey, permissions]) => (
          <div className="col-md-6" key={moduleKey}>
            <div className="card shadow-sm">
              <div className="card-header fw-bold">{moduleKey.toUpperCase()}</div>

              <div className="card-body">
                {Object.entries(permissions).map(([permKey, perm]) => (
                  <div className="form-check" key={permKey}>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id={`${moduleKey}-${permKey}`}
                      {...register(`permissions.${moduleKey}.${permKey}`)}
                    />

                    <label className="form-check-label" htmlFor={`${moduleKey}-${permKey}`}>
                      {perm.text}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="btn btn-primary mt-4">Guardar Rol</button>
    </form>
  )
}
