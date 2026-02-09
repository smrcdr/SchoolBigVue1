import pingController from "./ping.controllers";
import coursesController from "./courses.controllers";
import authController from "./auth.controllers";
import classController from "./class.controllers";
import usersControllers from "./users.controllers";

export default {
    ping: pingController.ping,
    courses: coursesController,
    auth: authController,
    class: classController,
    users: usersControllers
};
