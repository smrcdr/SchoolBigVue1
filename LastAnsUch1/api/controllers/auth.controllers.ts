import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import usersFunc from "../dbFunc/users.function";
import * as refreshTokensFunc from "../dbFunc/refreshToken.function";
import { generateAccess, generateRefresh } from "../jwt";
import "dotenv/config";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}







async function login(req: Request, res: Response) {
  const name = req.body?.name;
  const pass = req.body?.pass;

  if (!isNonEmptyString(name) || !isNonEmptyString(pass)) {
    return res.status(400).json({ error: "name and pass are required" });
  }

  const user = await usersFunc.getByName(name)
  if (!user) return res.status(401).json({ error: "Invalid data" });

  const ok = await bcrypt.compare(pass, user.hash);
  if (!ok) return res.status(401).json({ error: "Invalid data" });

  const access = generateAccess(user.id, user.name, user.role);
  const refresh = generateRefresh(user.id);

  await refreshTokensFunc.create(refresh, req.ip, req.get("user-agent"));

  return res.status(200).json({ access, refresh });
}






async function register(req: Request, res: Response) {
  const name = req.body?.name;
  const pass = req.body?.pass;
  const invite = req.body?.invite;

  if (!isNonEmptyString(name) || !isNonEmptyString(pass)) {
    return res.status(400).json({ error: "name and pass are required" });
  }

  const existing = await usersFunc.getByName(name);
  if (existing) return res.status(409).json({ error: "User already exists" });

  let role = "student";
  if (isNonEmptyString(invite) && process.env.SECRET_INVITE === invite) {
    role = "teacher";
  }

  const created = await usersFunc.create(name, pass, role);

  return res.status(201).json({ id: created.id, name: created.name, role });
}






async function logout(req: Request, res: Response) {
  const refresh = req.body?.refresh;
  if (!isNonEmptyString(refresh)) {
    return res.status(400).json({ error: "refresh is required" });
  }

  const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
  if (!JWT_REFRESH_SECRET) {
    return res.status(500).json({ error: "JWT_REFRESH_SECRET is not defined" });
  }

  try {
    jwt.verify(refresh, JWT_REFRESH_SECRET);
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const tokenRow = await refreshTokensFunc.findActiveByToken(refresh);
  if (!tokenRow) return res.status(401).json({ error: "Unauthorized" });

  await refreshTokensFunc.revoke(tokenRow.id);
  return res.status(200).json({ status: "ok" });
}






async function refresh(req: Request, res: Response) {
  const refreshToken = req.body?.refresh;
  if (!isNonEmptyString(refreshToken)) {
    return res.status(400).json({ error: "refresh is required" });
  }

  const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
  if (!JWT_REFRESH_SECRET) {
    return res.status(500).json({ error: "env error" });
  }

  let payload: any = null;
  try {
    payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as any;
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = (payload as any)?.userId;
  if (typeof userId !== "number") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const tokenRow = await refreshTokensFunc.findActiveByToken(refreshToken);
  if (!tokenRow) return res.status(401).json({ error: "Unauthorized" });

  const user = await usersFunc.getUser(userId);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  await refreshTokensFunc.revoke(tokenRow.id);


  const access = generateAccess(user.id, user.name, user.role);
  const newRefresh = generateRefresh(user.id);
  await refreshTokensFunc.create(newRefresh, req.ip, req.get("user-agent"));

  return res.status(200).json({ access, refresh: newRefresh });
}


export default { login, register, logout, refresh };
