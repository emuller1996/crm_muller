import md5 from "md5";
import jsonwebtoken from "jsonwebtoken";
import { client } from "../../../db.js";
import { INDEX_ES_MAIN, SECRECT_ADMIN } from "../../../config.js";
import { getDocumentById } from "../../../utils/index.js";

export const generateAdminToken = (user) => {
  return jsonwebtoken.sign(user, SECRECT_ADMIN, { expiresIn: "480m" });
};

export const login = async ({ email, password }) => {
  const searchResult = await client.search({
    index: INDEX_ES_MAIN,
    size: 1,
    body: {
      query: {
        bool: {
          must: [
            { term: { "type.keyword": "usuario_admin" } },
            { term: { "email.keyword": email } },
          ],
        },
      },
    },
  });

  const users = searchResult.body.hits.hits.map((c) => ({
    ...c._source,
    _id: c._id,
  }));

  if (!users.length) throw new Error("Usuario no registrado");

  const user = users[0];

  if (user.estado === "inactivo") throw new Error("Usuario deshabilitado");

  if (md5(password) !== user.password) throw new Error("Contrasena incorrecta");

  const { password: _, ...cleanUser } = user;

  // Enriquecer con datos de empresa
  if (cleanUser.empresa_id) {
    try {
      const empresa = await getDocumentById(cleanUser.empresa_id);
      cleanUser.empresa = {
        _id: empresa._id,
        razon_social: empresa.razon_social,
        logo: empresa.logo,
      };
    } catch {
      cleanUser.empresa = null;
    }
  }

  const token = generateAdminToken(cleanUser);

  return {
    message: "Login correcto",
    user: cleanUser,
    token,
  };
};

export const validateToken = (token) => {
  return jsonwebtoken.verify(token, SECRECT_ADMIN);
};
