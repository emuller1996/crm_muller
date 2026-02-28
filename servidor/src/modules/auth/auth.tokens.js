import jsonwebtoken from "jsonwebtoken";
import { SECRECT_CLIENT } from "../../config.js";

export const generateAccessToken = (user) => {
  return jsonwebtoken.sign(
    user,
    SECRECT_CLIENT,
    { expiresIn: "480m" }
  );
};