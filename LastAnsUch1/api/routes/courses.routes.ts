import { Router } from "express";
import controllers from "../controllers/index.controllers";
import { requireTeacher } from "../controllers/roleVerif.controllers";

const c = controllers.courses
const router = Router();

router.get("/", c.getCourses);
router.get("/:id", c.getCourseById);
router.post("/", requireTeacher, c.addCourse);
router.delete("/:id", requireTeacher, c.deleteCourse);
router.patch("/:id", requireTeacher, c.patchCourse);

export default router;
