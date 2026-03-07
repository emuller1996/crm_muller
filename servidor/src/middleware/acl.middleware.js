export const checkPermission = (permission) => {

  return (req, res, next) => {

    try {
      const user = req.user
      if (!user)
        return res.status(401).json({ message: "No autenticado" })

      const permissions =JSON.parse( user.role?.permissions)

      if (!permissions)
        return res.status(403).json({ message: "Sin permisos definidos" })

      const [module, action] = permission.split(".")

      const hasPermission =
        permissions?.[module]?.[action] === true

      if (!hasPermission) {
        return res.status(403).json({
          message: `No tienes permiso para esta realizar esta accion : ${permission}`,
        })
      }

      next()

    } catch (error) {
      console.log(error)

      return res.status(500).json({
        message: "Error validando permisos",
      })
    }

  }

}