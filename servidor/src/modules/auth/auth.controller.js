import * as service from "./auth.service.js";

export const login = async (req, res) => {
  try {
    const result = await service.login(req.body);
    return res.json(result);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};