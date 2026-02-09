import express from "express";
import apiRoutes from "./routes/index.routes";
import { decodeJWT } from "./jwt";
import cors from 'cors'



const app = express();


app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}))

app.use(express.json());

app.use(decodeJWT)

app.use("/api", apiRoutes);

export {app}