import {Request, Response} from "express";
import classFunc from "../dbFunc/class.function";
import usersFunc from "../dbFunc/users.function";

function isNonEmptyString(value: unknown): value is string {
    return typeof value === "string" && value.trim().length > 0;
}

async function createUser(req: Request, res: Response) {
    const name = req.body?.name;
    const pass = req.body?.pass;
    const roleRaw = req.body?.role;

    if (!isNonEmptyString(name) || !isNonEmptyString(pass)) {
        return res.status(400).json({error: "name and pass are required"})
    }

    if (roleRaw !== undefined && roleRaw !== "student" && roleRaw !== "teacher") {
        return res.status(400).json({error: "role must be student or teacher"})
    }

    const role = roleRaw === "teacher" ? "teacher" : "student";

    const existed = await usersFunc.getByName(name);
    if (existed) return res.status(409).json({error: "User already exists"})

    const created = await usersFunc.create(name, pass, role);
    return res.status(201).json({
        id: created.id,
        name: created.name,
        role: created.role
    });
}


async function getUsersNotClass(req: Request, res: Response) {

    await classFunc.getAllUsersNotInClass()
        .catch(err => res.status(500).json({ error: err}))
        .then(result => res.status(200).json(result))
}


async function addUserInClass(req: Request, res: Response) {
    const userId: number = Number(req.params.userId)
    const classId: number = Number(req.body.classId)



    if (isNaN(userId)) return res.status(400).json({error: "userId is not number"})

    if (req.body.classId === null) {
        await classFunc.deleteUserInClass(userId)
            .catch(err => res.status(500).json({ error: err}))
            .then(result => res.status(200).json(result))
        return
    }

    if (isNaN(classId)) return res.status(400).json({error: "classId is not number"})



    await classFunc.addUserInClass(userId, classId)
        .catch(err => res.status(500).json({ error: err}))
        .then(result => res.status(200).json(result))
}

/*async function deleteUserInClass(req: Request, res: Response) {
    const userId: number = Number(req.params.userId)
    const classId: number = Number(req.params.id)

    if (isNaN(userId)) return res.status(400).json({error: "userId is not number"})
    if (isNaN(classId)) return res.status(400).json({error: "classId is not number"})

    await classFunc.deleteUserInClass(userId)
        .catch(err => res.status(500).json({ error: err}))
        .then(result => res.status(200).json({status: "ok"}))
}
*/

export default {createUser, addUserInClass, getUsersNotClass}
