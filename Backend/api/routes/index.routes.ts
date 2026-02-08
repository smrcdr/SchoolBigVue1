import { Router } from "express";
import pingRoutes from "./ping.routes";
import coursesRoutes from "./courses.routes";
import authRoutes from "./auth.routes";
import usersRoutes from "./users.routes";
import classesRoutes from "./classes.routes";
import { auth } from "../jwt";

const router = Router();

router.use("/ping", pingRoutes);
router.use("/auth", authRoutes);

router.use(auth);
router.use("/courses", coursesRoutes);
router.use("/students", usersRoutes)
router.use("/users", usersRoutes)
router.use("/classes", classesRoutes)

export default router;
