import { Client } from "@elastic/elasticsearch";
import dotenv from "dotenv";

dotenv.config();
export const client = new Client({
  //node: "http://localhost:9200/",
  node: "http://69.48.204.36:9200/",
  auth: { username: process.env.USER_ELASTIC, password: process.env.PASS_ELASTIC },
});
