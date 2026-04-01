import * as service from "./auth.service.js";

export const login = async (req, res) => {
  try {
    const result = await service.login(req.body);
    return res.json(result);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const validate = async (req, res) => {
  try {
    const token = req.headers["access-token"];
    if (!token) return res.status(401).json({ message: "Token no proporcionado" });

    const decoded = service.validateToken(token);
    return res.json({ message: "Token valido", user: decoded });
  } catch (error) {
    return res.status(401).json({ message: "Token invalido o expirado" });
  }
};
