import {Request, Response} from "express";
import classFunc from "../dbFunc/class.function";


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

export default {addUserInClass, getUsersNotClass}