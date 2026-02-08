import express from "express";
import apiRoutes from "./routes/index.routes";
import { decodeJWT } from "./jwt";

const app = express();

app.use(express.json());

app.use(decodeJWT)

app.use("/api", apiRoutes);

export {app}