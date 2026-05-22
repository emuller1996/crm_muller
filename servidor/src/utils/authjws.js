import jsonwebtoken from "jsonwebtoken";
import { SECRECT_CLIENT, SECRECT_CLIENT_CLIENT } from "../config.js";
import { getDocumentById } from "./index.js";

const validateToken = (req, res) => {
  const accessToken = req.headers["access-token"];
  if (!accessToken)
    return res
      .status(403)
      .json({ message: "ACCES DENIED: TOKEN NO SUMINISTRADO." });
  jsonwebtoken.verify(accessToken,SECRECT_CLIENT, (err, user) => {
    if (err) {
      return res
        .status(405)
        .json({ message: "ERROR-> TOKEN EXPIRED OR INCORRECT" });
    } else {
      return res.status(200).json({ message: "ALL FINE" });
    }
  });
};




const validateTokenClientMid = (req, res, next) => {
  const accessToken = req.headers["authorization"];
  if (!accessToken)
    return res
      .status(403)
      .json({ message: "ACCES DENIED: TOKEN NO SUMINISTRADO." });
  jsonwebtoken.verify(accessToken,SECRECT_CLIENT_CLIENT, (err, user) => {
    if (err) {
      return res
        .status(405)
        .json({ message: "ERROR-> TOKEN EXPIRED OR INCORRECT" });
    } else {
      next();
    }
  });
};


const validateTokenMid = async (req, res, next) => {
  try {
    // 1. Extracción del token
    const accessToken = req.headers["access-token"] || req.headers["authorization"]?.split(" ")[1];
    
    if (!accessToken) {
      return res.status(401).json({
        status: "error",
        code: "TOKEN_MISSING",
        message: "No se proporcionó un token de autenticación. Por favor, incluya un token válido en el header 'access-token' o 'Authorization: Bearer <token>'.",
        timestamp: new Date().toISOString(),
        path: req.originalUrl
      });
    }

    // 2. Verificación del token
    let decoded;
    try {
      decoded = jsonwebtoken.verify(accessToken, SECRECT_CLIENT);
    } catch (jwtError) {
      const errorResponse = {
        status: "error",
        code: "TOKEN_INVALID",
        timestamp: new Date().toISOString(),
        path: req.originalUrl
      };

      if (jwtError.name === "TokenExpiredError") {
        errorResponse.code = "TOKEN_EXPIRED";
        errorResponse.message = "El token de autenticación ha expirado. Por favor, solicite un nuevo token.";
        errorResponse.expiredAt = jwtError.expiredAt;
      } else if (jwtError.name === "JsonWebTokenError") {
        errorResponse.message = "El token de autenticación es inválido o está mal formado. Verifique que sea un token JWT válido.";
      } else {
        errorResponse.message = "Error al verificar el token de autenticación.";
      }

      return res.status(401).json(errorResponse);
    }

    // 3. Asignación de datos básicos del token
    req.empresaId = decoded.empresa_id;
    req.tokenData = decoded;

    // 4. Obtención y enriquecimiento del usuario
    const user = await getDocumentById(decoded._id);
    
    if (!user) {
      return res.status(404).json({
        status: "error",
        code: "USER_NOT_FOUND",
        message: "El usuario asociado al token no existe en el sistema. Posiblemente fue eliminado o desactivado.",
        timestamp: new Date().toISOString(),
        path: req.originalUrl
      });
    }

    // 5. Procesamiento del rol del usuario
    if (user.role_id) {
      if (user.role_id === "super_user") {
        user.role = {
          id: "super_user",
          name: "Super Usuario",
          type: "system",
          permissions: ["*"] // Opcional: indicar permisos completos
        };
      } else {
        const role = await getDocumentById(user.role_id);
        if (role) {
          user.role = {
            id: role._id,
            name: role.name || role.nombre,
            permissions: role.permissions || []
          };
        } else {
          user.role = {
            id: user.role_id,
            name: "Rol no encontrado",
            type: "unknown"
          };
        }
      }
    }

    // 6. Limpieza de datos sensibles (opcional pero recomendado)
    delete user.password;
    delete user.token;
    delete user.__v;

    // 7. Asignación del usuario enriquecido al request
    req.user = user;
    req.authInfo = {
      authenticatedAt: new Date().toISOString(),
      method: "JWT",
      tokenIssuedAt: new Date(decoded.iat * 1000).toISOString(),
      tokenExpiresAt: new Date(decoded.exp * 1000).toISOString()
    };

    // 8. Log de auditoría (opcional)
    if (process.env.NODE_ENV === "production") {
      console.log(`[AUTH] Usuario ${user._id} autenticado exitosamente en ${req.originalUrl}`);
    }

    next();
  } catch (error) {
    // Error inesperado del servidor
    console.error("[AUTH_MIDDLEWARE_ERROR]", error);
    
    return res.status(500).json({
      status: "error",
      code: "INTERNAL_AUTH_ERROR",
      message: "Ha ocurrido un error interno durante la autenticación. Por favor, intente nuevamente más tarde.",
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      requestId: req.headers["x-request-id"] || null
    });
  }
};

const generateClienteAccessToken = (user) => {
  return jsonwebtoken.sign(user, SECRECT_CLIENT_CLIENT, { expiresIn: "240m" });
};

export { validateToken, validateTokenMid, generateClienteAccessToken, validateTokenClientMid };
