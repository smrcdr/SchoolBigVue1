import { Request, Response } from "express";

import classFunc from "../dbFunc/class.function";

import "dotenv/config";
import {prisma} from "../../lib/prisma";

async function createClass(req: Request, res: Response) {
    const name: string | undefined = req.body.name

    if (!name) return res.status(400).json({error: "name is empty"})

    classFunc.create(name)
        .catch(err => res.status(500).json({ error: err}))
        .then(result => res.status(201).json(result))
}

async function deleteClass(req: Request, res: Response) {
    const id: number = Number(req.params.classId)

    if (isNaN(id)) return res.status(400).json({error: "Id is not number"})

    classFunc.delete(id)
        .catch(err => res.status(500).json({ error: err}))
        .then(result => res.status(204).end())
}

async function changeNameClass(req: Request, res: Response) {
    const id: number = Number(req.params.classId)
    const name: string = req.body.name.toString()

    if (isNaN(id)) return res.status(400).json({error: "Id is not number"})
    if (!name.trim()) return res.status(400).json({error: "name is empty"})


    if (!await prisma.class.findFirst({
        where: {
            id
        }
    })) return res.status(404).json({error: "class not found"})

    classFunc.changeName(id, name)
        .catch(err => res.status(500).json({ error: err}))
        .then(result => res.status(200).json(result))
}

// Мне лень в отдельный файл выносить эту единственную функцию... Пусть здесь поживёт


async function connectCourseInClass(req: Request, res: Response) {
    const courseId: number = Number(req.body.courseId)
    const classId: number = Number(req.params.classId)

    if (isNaN(classId)) return res.status(400).json({error: "classId is not number"})
    if (isNaN(courseId)) return res.status(400).json({error: "courseId is not number"})

    classFunc.connectCourseAtClass(courseId, classId)
        .catch(err => res.status(500).json({ error: err}))
        .then(result => res.status(201).json({status: "ok"}))
}

async function disconnectCourseInClass(req: Request, res: Response) {
    const courseId: number = Number(req.params.courseId)
    const classId: number = Number(req.params.classId)

    if (isNaN(courseId)) return res.status(400).json({error: "courseId is not number"})
    if (isNaN(classId)) return res.status(400).json({error: "classId is not number"})

    classFunc.deleteCourseAtClass(courseId, classId)
        .catch(err => res.status(500).json({ error: err}))
        .then(result => res.status(204).end())
}

async function getAllClasses(req: Request, res: Response) {
    classFunc.getAllClasses()
        .catch(err => res.status(500).json({ error: err}))
        .then(result => res.status(200).json(result))
}

async function getClassById(req: Request, res: Response) {
    const classId: number = Number(req.params.classId)

    if (isNaN(classId)) return res.status(400).json({error: "classId is not number"})
    if (!await prisma.class.findFirst({
        where: {
            id: classId
        }
    })) return res.status(404).json({error: "class not found"})

    classFunc.getClassById(classId)
        .catch(err => res.status(500).json({ error: err}))
        .then(result => res.status(200).json(result))
}

export default {getClassById, getAllClasses, createClass, connectCourseInClass, deleteClass, changeNameClass, disconnectCourseInClass}