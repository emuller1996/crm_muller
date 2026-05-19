import express from "express";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes/index.js";
import fileUpload from "express-fileupload";
import { auditLogMiddleware } from "./middleware/auditLog.middleware.js";

dotenv.config();
const server = express();

// Configuración más robusta
const corsOptions = {
    origin:[
        'https://crm.esmuller.cloud',
        'https://crm-muller-admin.vercel.app'
    ],
    credentials: true,
    optionsSuccessStatus: 200
};

server.use(cors(corsOptions));

// Middleware para asegurar CORS incluso en errores
server.use((err, req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://crm.esmuller.cloud');
    res.header('Access-Control-Allow-Credentials', 'true');
    next(err);
});

server.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
server.use(bodyParser.json({ limit: "50mb" }));
server.use(cookieParser());
server.use(morgan("dev"));
server.use(fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/"
  }));
  


server.use("/uploads", express.static("uploads"));
server.use(auditLogMiddleware);
server.use("/", routes);

// Error catching endware.

export default server;
