export function getHTMLOrderDetail(data) {
  let HTMLTBODY = ``;
  data.products.forEach((element) => {
    HTMLTBODY += `<tr class="">
                  <td scope="row">${element?.producto_data?.name ?? ""}</td>
                  <td>${element?.price ?? ""}</td>
                  <td>${element?.cantidad ?? ""}</td>
                  <td>${element?.stock_data?.size ?? ""}</td>
                  <td>${element?.price * element?.cantidad ?? ""}</td>
                </tr>`;
  });

  let HTML = `<!DOCTYPE html>
<html lang="en">
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
        width: 95%;
      }
      .text-center {
        text-align: center;
      }
      .card-img-top {
        padding: 2em 0;
      }
      .card {
        border: 1px solid red;
        border-radius: 0.3em;
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
        background-color: #e69595;
        box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
        padding: 1em;
        text-decoration: none;
      }
      p {
        margin-bottom: 1em;
      }

      table {
        border-collapse: collapse;
        background-color: white;
        width: 500px;
        border-radius: 0.3em;
      }
      .table-responsive{
        background-color: white;
        border-radius: 0.3em;
        overflow: hidden;

        border: #e69595 solid 1px;
        box-shadow: rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px;

      }

      th,
      td {
        font-family: "Motnserrat", sans-serif;
        text-align: left;
        font-size: 12px;
        padding: 10px;
      }

      th {
        background-color: #ff8080;
        color: white;
      }
      h3{
        color: #494949;
        text-transform: uppercase;
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
          <h3>Detalle de su Compra</h3>
          <div class="table-responsive" style="margin-bottom: 1em;">
            <table class="table table-primary" style="width: 100%">
                <tr class="">
                  <td scope="row">Nombre</td>
                  <td>${data?.cliente?.name_client ?? ""}</td>
                </tr>
                <tr class="">
                  <td scope="row">Telefono</td>
                  <td>${data?.cliente?.phone_client ?? ""}</td>
                </tr>
                <tr class="">
                  <td scope="row">Direccion</td>
                  <td>${data?.address?.address ?? ""}</td>
                </tr>
                <tr class="">
                  <td scope="row">Cuidad</td>
                  <td>${data?.address?.city ?? ""}</td>
                </tr>
                <tr class="">
                  <td scope="row">Departamento.</td>
                  <td>${data?.address?.departament ?? ""}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="table-responsive">
            <table class="table table-primary" style="width: 100%">
              <thead>
                <tr>
                  <th scope="col">Producto</th>
                  <th scope="col">Precio U.</th>
                  <th scope="col">Cantidad</th>
                  <th scope="col">Talla</th>
                  <th scope="col">Total</th>
                </tr>
              </thead>
              <tbody>
                
${HTMLTBODY}
                
              </tbody>
            </table>
          </div>

          <p>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Maxime
            minima suscipit provident repudiandae porro id rerum quasi quos?
            Voluptate consequuntur fugit quia sequi aspernatur voluptas nisi
            iusto? Similique, aut minima.
          </p>
          <div style="margin-top: 10px">
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
`;

  return HTML;
}

export function getHTMLRespuestaEmailDetail(data) {
  let HTML = `
 <!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CORREO TEST</title>
    <style>
      * {
        font-family: Cambria, Verdana, Geneva, Tahoma, sans-serif, sans-serif;
      }
      .container {
        margin: auto;
        width: 80%;
      }
      .text-center {
        text-align: center;
      }
      .card-img-top {
        padding: 2em 0;
      }
      .card {
        border: 2px solid #b4b4b4;
        border-radius: 0.5em;
        overflow: hidden;
        box-shadow: rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px;
      }
      .card-body {
        padding: 2em;
        background-color: rgb(246, 249, 255);
        color: #3f3f3f;
      }
      hr {
        margin: 0;
        border-color: rgb(179, 206, 245);;
      }
      .btn {
        margin-top: 3em;
        background-color: rgb(179, 206, 245);
        box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
        padding: 1em;
        text-decoration: none;
      }
      p {
        margin-bottom: 1em;
      }
      .text-muted {
        color: #646464;
      }
      .text-content {
        width: 70%;
        margin: auto;
        margin-top: 30px;
        margin-bottom: 50px;
        font-weight: 600;
      }
  
      .d-flex {
        width: 50%;
        margin: auto;
        display: flex;
        justify-content: space-between;
      }
  
      .card-header {
        background: #8a9fff;
        background-color: rgb(179, 206, 245);
      }
  
      /* CSS */
      .button-29 {
        align-items: center;
        appearance: none;
        background-color: rgb(179, 206, 245);
        padding: 1em;
        border: 0;
        border-radius: 6px;
        box-shadow: rgba(45, 35, 66, 0.4) 0 2px 4px,
          rgba(45, 35, 66, 0.3) 0 7px 13px -3px,
          rgba(58, 65, 111, 0.5) 0 -3px 0 inset;
        box-sizing: border-box;
        color: #fff;
        cursor: pointer;
        display: inline-flex;
        height: 48px;
        font-family: "JetBrains Mono", monospace;
  
        font-size: 18px;
      }
    </style>
  </head>


  <body>
    <div class="container mt-5">
      <div class="card shadow">
        <div class="text-center pt-4 m-0 pb-2 card-header">
          <img
            class="card-img-top"
            src="https://www.esmuller.cloud/assets/Logo-LBxHafXJ.png"
            alt="Title"
            style="width: 110px"
          />
          <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; padding-bottom: 1.5em;">
            <span style="font-size: 1.5em; color: #c93333;">Tienda Electronica.</span>
            <span style="font-size: 0.9em; color: #525252;">American Shop Sport</span>
            <span style="font-size: 0.7em; color: #525252;">www.esmuller.cloud</span>
          </div>
        </div>
        <hr class="m-0" />
        <div class="card-body text-center">
          <h2 class="text-header-card">
           Hola ${data?.cliente?.name_client??''}, se ha respondido tu consulta de un producto.
          </h2>
          <p class="text-muted text-content">
            ${data?.consulta ?? ""}
          </p>
          <h3>Respuesta</h3>
          <p class="text-muted text-content">
            ${data?.respuesta ?? ""}
          </p>

          <div class="d-flex">
            <span> Fecha: ${new Date(
              data?.createdTime
            ).toLocaleDateString()}</span>

            <div>Respondido por <b> ${data?.user?.name ?? ""}</b></div>
          </div>
          <div style="margin-top: 30px">
            <a href="https://esmuller.cloud/" class="button-29"
              >Explorar Tienda</a
            >
          </div>
          
        </div>
        <div style="background-color:  rgb(179, 206, 245); padding: 0.5em;">
          <span style="color: rgb(77, 77, 77);">
            Power By © MullerDev 2025
          </span>
        </div>
      </div>
    </div>
  </body>
</html>


`;

  return HTML;
}
