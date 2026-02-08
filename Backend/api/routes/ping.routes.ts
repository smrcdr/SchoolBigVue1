import { Router } from "express";
import controllers from "../controllers/index.controllers";

const c = controllers
const router = Router();

router.get("/", c.ping);

export default router;

