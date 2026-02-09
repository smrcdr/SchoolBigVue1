import { Router } from "express";
import controllers from "../controllers/index.controllers";
import { requireTeacher } from "../controllers/roleVerif.controllers";

const c = controllers.class;
const router = Router();


router.post("/", requireTeacher, c.createClass)
router.delete("/:classId", requireTeacher, c.deleteClass)
router.patch("/:classId", requireTeacher, c.changeNameClass)

router.post("/:classId/courses", requireTeacher, c.connectCourseInClass)
router.delete("/:classId/courses/:courseId", requireTeacher, c.disconnectCourseInClass)

router.get("/", requireTeacher, c.getAllClasses)
router.get("/:classId", requireTeacher, c.getClassById)

export default router