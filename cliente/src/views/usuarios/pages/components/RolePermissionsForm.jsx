/* eslint-disable prettier/prettier */
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { ACL_APP } from '../../../../utils/ACL'
import { useUsuarios } from '../../../../hooks/useUsuarios'
import toast from 'react-hot-toast'
import PropTypes from 'prop-types'

export default function RolePermissionsForm({ onHide, allRole, role }) {
  RolePermissionsForm.propTypes = {
    onHide: PropTypes.func,
    allRole: PropTypes.func,
    role: PropTypes.object,
  }
  const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: { permissions: {} },
  })

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

  const watchedPermissions = watch('permissions') || {}

  // Helpers para calcular estado de checkboxes "todo"
  const isModuleAllChecked = (moduleKey, permissions) => {
    const modulePerms = watchedPermissions[moduleKey] || {}
    return Object.keys(permissions).every((permKey) => !!modulePerms[permKey])
  }

  const isGlobalAllChecked = () => {
    return Object.entries(ACL_APP.modules).every(([moduleKey, permissions]) =>
      isModuleAllChecked(moduleKey, permissions),
    )
  }

  // Handlers
  const handleToggleModule = (moduleKey, permissions, checked) => {
    Object.keys(permissions).forEach((permKey) => {
      setValue(`permissions.${moduleKey}.${permKey}`, checked, { shouldDirty: true })
    })
  }

  const handleToggleGlobal = (checked) => {
    Object.entries(ACL_APP.modules).forEach(([moduleKey, permissions]) => {
      handleToggleModule(moduleKey, permissions, checked)
    })
  }

  const onSubmit = async (data) => {
    const payload = {
      name: data.name,
      permissions: JSON.stringify(data.permissions || {}),
    }
    if (role) {
      try {
        const result = await putUpdateRole(payload, role._id)
        toast.success(result.data.message)
        onHide()
        allRole()
      } catch (error) {
        console.log(error)
      }
    } else {
      try {
        const result = await postCreateRole(payload)
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
      <div className="mb-3">
        <label className="form-label fw-bold">Nombre del rol</label>
        <input
          className="form-control"
          placeholder="Ej: Administrador"
          {...register('name', { required: true })}
        />
      </div>

      {/* TOGGLE GLOBAL */}
      <div className="alert alert-light border d-flex justify-content-between align-items-center py-2 mb-3">
        <div>
          <i className="fa-solid fa-shield-halved me-2 text-primary"></i>
          <strong>Asignar todos los permisos</strong>
          <div className="small text-muted">Marca o desmarca todos los modulos y permisos</div>
        </div>
        <div className="form-check form-switch m-0">
          <input
            type="checkbox"
            className="form-check-input"
            style={{ width: 48, height: 24, cursor: 'pointer' }}
            id="toggle-all-global"
            checked={isGlobalAllChecked()}
            onChange={(e) => handleToggleGlobal(e.target.checked)}
          />
        </div>
      </div>

      {/* PERMISOS POR MODULO */}
      <div className="row g-3">
        {Object.entries(ACL_APP.modules).map(([moduleKey, permissions]) => {
          const allModuleChecked = isModuleAllChecked(moduleKey, permissions)
          return (
            <div className="col-md-6" key={moduleKey}>
              <div className="card shadow-sm h-100">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <span className="fw-bold text-uppercase">{moduleKey}</span>
                  <div className="form-check m-0">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id={`toggle-all-${moduleKey}`}
                      checked={allModuleChecked}
                      onChange={(e) =>
                        handleToggleModule(moduleKey, permissions, e.target.checked)
                      }
                    />
                    <label
                      className="form-check-label small text-muted"
                      htmlFor={`toggle-all-${moduleKey}`}
                    >
                      Todos
                    </label>
                  </div>
                </div>

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
          )
        })}
      </div>

      <button className="btn btn-primary mt-4">Guardar Rol</button>
    </form>
  )
}
