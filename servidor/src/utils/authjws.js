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

const validateTokenClient = (req, res) => {
  const accessToken = req.headers["authorization"];
  if (!accessToken)
    return res
      .status(403)
      .json({ message: "ACCES DENIED: TOKEN NO SUMINISTRADO." });
  jsonwebtoken.verify(accessToken,SECRECT_CLIENT_CLIENT, async (err, user) => {
    if (err) {
      return res
        .status(405)
        .json({ message: "ERROR-> TOKEN EXPIRED OR INCORRECT" });
    } else {
      const clienteData = await getDocumentById(user._id);
      delete clienteData.hash;
      return res.status(200).json({ message: "ALL FINE" ,user:clienteData});
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


const validateTokenMid = (req, res, next) => {
  const accessToken = req.headers["access-token"];
  if (!accessToken)
    return res
      .status(403)
      .json({ message: "ACCES DENIED: TOKEN NO SUMINISTRADO." });
  jsonwebtoken.verify(accessToken, SECRECT_CLIENT, (err, user) => {
    if (err) {
      return res
        .status(405)
        .json({ message: "ERROR-> TOKEN EXPIRED OR INCORRECT" });
    } else {
      next();
    }
  });
};

const generateClienteAccessToken = (user) => {
  return jsonwebtoken.sign(user, SECRECT_CLIENT_CLIENT, { expiresIn: "240m" });
};

export { validateToken, validateTokenMid, generateClienteAccessToken, validateTokenClient,validateTokenClientMid };
