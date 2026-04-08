import md5 from "md5";
import { client } from "../../db.js";
import { INDEX_ES_MAIN } from "../../config.js";

import { buildUserResponse } from "./auth.helpers.js";

import { generateAccessToken } from "./auth.tokens.js";
import { getDocumentById } from "../../utils/index.js";

export const login = async ({ email, password }) => {
  const searchResult = await client.search({
    index: INDEX_ES_MAIN,
    size: 1,
    body: {
      query: {
        bool: {
          must: [
            {
              term: {
                "type.keyword": "usuario",
              },
            },
            {
              term: {
                "email.keyword": email,
              },
            },
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

  const passTest = md5(password);

  if (passTest !== user.password) throw new Error("Contraseña incorrecta");

  const cleanUser = buildUserResponse(user);

  const empresaUser = await getDocumentById(cleanUser?.empresa_id);
  cleanUser.empresa = empresaUser;

  if (cleanUser.role_id) {
    if (cleanUser.role_id === "super_user") {
      cleanUser.role = "Super Usuario";
    } else {
      const roleUser = await getDocumentById(cleanUser?.role_id);
      cleanUser.role = roleUser.name;
    }
  } else {
    cleanUser.role = null;
  }

  const token = generateAccessToken(cleanUser);

  return {
    message: "Login correcto",
    user: cleanUser,
    token,
  };
};
