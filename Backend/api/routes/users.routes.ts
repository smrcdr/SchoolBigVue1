import { Router } from "express";
import controllers from "../controllers/index.controllers";
import { requireTeacher } from "../controllers/roleVerif.controllers";

const c = controllers.users;
const router = Router();

router.post("/", c.createUser)
router.get("/no-class", requireTeacher, c.getUsersNotClass)

router.patch("/:userId", requireTeacher, c.addUserInClass)


export default router
