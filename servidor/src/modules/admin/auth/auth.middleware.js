import { validateToken } from "./auth.service.js";

export const validateAdminTokenMid = (req, res, next) => {
  try {
    const token = req.headers["access-token"];
    if (!token) {
      return res.status(401).json({ message: "Token no proporcionado" });
    }

    const decoded = validateToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token invalido o expirado" });
  }
};
