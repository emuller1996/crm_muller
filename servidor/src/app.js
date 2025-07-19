import express from "express";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes/index.js";
import fileUpload from "express-fileupload";

dotenv.config();
const server = express();

server.use(cors());
server.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
server.use(bodyParser.json({ limit: "50mb" }));
server.use(cookieParser());
server.use(morgan("dev"));
server.use(fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/"
  }));
  


server.use("/", routes);

// Error catching endware.

export default server;
