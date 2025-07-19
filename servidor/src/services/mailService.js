import { createTransport } from "nodemailer";
import "dotenv/config";
import { getHTMLOrderDetail, getHTMLRespuestaEmailDetail } from "./MailUtils.js";
// Configurar el transporte SMTP de IONOS
const transporter = createTransport({
  host: "smtp.ionos.com", // Servidor SMTP de IONOS
  port: 465, // Puerto seguro SSL
  secure: true, // true para SSL, false para STARTTLS
  auth: {
    user: process.env.USER_SMTP, // Tu correo de IONOS
    pass: process.env.PASS_SMTP, // Tu contraseña
  },
  tls: {
    rejectUnauthorized: false, // 🔴 Desactiva la verificación del certificado
  },
});

// Función para enviar el correo de verificación
export const sendVerificationEmail = async (email) => {
  const mailOptions = {
    from: '"ECOMMERCE AMERICAN SHOP" <ecommerce-dev@esmuller.cloud>', // Remitente
    to: email, // Destinatario
    subject: "Bienvenido",
    html: `
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CORREO TEST</title>
      <style>
        * {
          font-family: Tahoma, sans-serif;
        }
        .container {
          margin: auto;
          width: 70%;
        }
        .text-center {
          text-align: center;
        }
        .card-img-top {
          padding: 2em 0;
        }
        .card {
          border: 1px solid red;
          border-radius: 1em;
          overflow: hidden;
          box-shadow: rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px;
        }
        .card-body {
          padding: 2em;
        }
        hr {
          margin: 0;
          border-color: rgb(255, 204, 204);
        }
        .btn {
          margin-top: 3em;
          background-color: rgb(230, 149, 149);
          box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
          padding: 1em;
          text-decoration: none;
        }
        p {
          margin-bottom: 1em;
        }
      </style>
  </head>

  <body>
    <div class="container mt-5">
      <div class="card shadow" style="border-color: rgb(255, 207, 207)">
        <div
          class="text-center pt-4 m-0 pb-2"
          style="background-color: rgb(255, 180, 180)"
        >
          <img
            class="card-img-top"
            src="https://esmuller.cloud/assets/Logo-LBxHafXJ.png"
            alt="Title"
            style="width: 110px"
          />
        </div>
        <hr class="m-0" />
        <div class="card-body text-center">
          <h3>Bienenido a AmericanShop Ecommerce</h3>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Maxime
            minima suscipit provident repudiandae porro id rerum quasi quos?
            Voluptate consequuntur fugit quia sequi aspernatur voluptas nisi
            iusto? Similique, aut minima.
          </p>
          <div style="margin-top: 10px;">
            <a
              href="https://ecommerce.esmuller.cloud/"
              class="button-9 btn btn-danger"
              >Explorar Tienda</a
            >
          </div>
        </div>
      </div>
    </div>
  </body>
</html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Correo de verificación enviado a ${email}`);
  } catch (error) {
    console.error("Error enviando el correo:", error);
  }
};


export const sendOrdenDetail = async (data) => {
  try {
    let html = getHTMLOrderDetail(data);
    console.log(html);
    const mailOptions = {
      from: '"ECOMMERCE AMERICAN SHOP (DETALLE DE COMPRA)" <ecommerce-dev@esmuller.cloud>', // Remitente
      to: data?.cliente?.email_client, // Destinatario
      subject: "DETALLE DE COMPRA",
      html: html,
    };
    await transporter.sendMail(mailOptions);
    console.log(`Correo de verificación enviado a ${data?.cliente?.email_client}`);
  } catch (error) {
    console.error("Error enviando el correo:", error);
  }
};


export const sendRespuestaConsultaEmail = async (data) => {
  try {
    let html = getHTMLRespuestaEmailDetail(data);
    console.log(html);
    const mailOptions = {
      from: '"ECOMMERCE AMERICAN SHOP (RESPUESTA A CONSULTA)" <ecommerce-dev@esmuller.cloud>', // Remitente
      to: data?.cliente?.email_client, // Destinatario
      subject: "RESPUESTA A CONSULTA",
      html: html,
    };
    await transporter.sendMail(mailOptions);
    console.log(`Correo Respuesta se ha enviado a ${data?.cliente?.email_client}`);
  } catch (error) {
    console.error("Error enviando el correo:", error);
  }
};
