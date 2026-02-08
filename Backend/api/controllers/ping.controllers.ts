import { Request, Response } from "express";

function ping(req: Request, res: Response) {
  res.status(200).json({ status: "ok" });
}

export default { ping: ping };
