import { Request, Response } from "express";
import courseFunc from "../dbFunc/course.function";

function getCourses(req: Request, res: Response) {
  courseFunc
    .getCourses()
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((reason) => {
      res.status(400).json(reason);
    });
}

function getCourseById(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "id is not number" });
  }

  courseFunc
    .getCourse(id)
    .then((result) => {
      if (result) res.status(200).json(result);
      else res.status(404).json({ error: "Course not found" });
    })
    .catch((reason) => {
      res.status(400).json(reason);
    });
}

function addCourse(req: Request, res: Response) {
  const name = req.body.name;
  const description = req.body.description;
  const duration = Number(req.body.duration);

  if (typeof name !== "string" || typeof description !== "string") {
    return res.status(400).json({ error: "Invalid payload" });
  }

  if (!Number.isFinite(duration)) {
    return res.status(400).json({ error: "duration must be a number" });
  }

  courseFunc
    .addCourse(name, description, duration)
    .then(result => {
      res.status(200).json(result);
    })
    .catch((e) => {
      res.status(400).json({ error: e });
    });
}

function deleteCourse(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "id is not number" });
  }

  courseFunc
    .deleteCourse(id)
    .then(() => {
      res.status(204).end();
    })
    .catch((e) => {
      res.status(400).json({ error: e });
    });
}

function patchCourse(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "id is not number" });
  }
  const par = req.body.parameter;
  const value = req.body.value;

  if (typeof par !== "string") return res.status(400).json({ error: "not valid json" });

  const allowed = new Set(["name", "description", "duration"]);
  if (!allowed.has(par)) {
    return res.status(400).json({ error: "parameter is not allowed" });
  }

  let normalizedValue: unknown = value;
  if (par === "duration") {
    const num = Number(value);
    if (!Number.isFinite(num)) {
      return res.status(400).json({ error: "duration must be a number" });
    }
    normalizedValue = num;
  } else {
    if (typeof value !== "string") {
      return res.status(400).json({ error: "value must be a string" });
    }
  }

  courseFunc
    .updateCourse(id, par, normalizedValue)
    .then(() => {
      res.status(200).json({ status: "ok" });
    })
    .catch((e) => {
      res.status(400).json({ error: e });
    });
}

export default { getCourses, getCourseById, addCourse, deleteCourse, patchCourse };
