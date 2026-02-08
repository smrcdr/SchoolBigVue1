import { Router } from "express";
import controllers from "../controllers/index.controllers";

const c = controllers.auth;
const router = Router();

router.post("/register", c.register);
router.post("/login", c.login);
router.post("/refresh", c.refresh);
router.post("/logout", c.logout);

export default router;
