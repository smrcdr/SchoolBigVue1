import request from "supertest";
import { app } from "../app";
import { prisma } from "../../lib/prisma";

const PREFIX = `jest_crash_${Date.now()}_${Math.random().toString(16).slice(2)}`;

function name(suffix: string) {
  return `${PREFIX}_${suffix}`;
}

let teacherAccess = "";
let teacherRefresh = "";
let studentAccess = "";

const UA = name("ua");

beforeAll(async () => {
  const teacherName = name("teacher");
  const teacherPass = "777";
  const studentName = name("student");
  const studentPass = "EzzAvtomat";

  const regTeacher = await request(app)
    .post("/api/auth/register")
    .send({ name: teacherName, pass: teacherPass, invite: "SmartestJS_Yghfjih@/f" });
  expect(regTeacher.status).toBe(201);

  const regStudent = await request(app).post("/api/auth/register").send({ name: studentName, pass: studentPass });
  expect(regStudent.status).toBe(201);

  const loginTeacher = await request(app)
    .post("/api/auth/login")
    .set("User-Agent", UA)
    .send({ name: teacherName, pass: teacherPass });
  expect(loginTeacher.status).toBe(200);
  teacherAccess = loginTeacher.body.access;
  teacherRefresh = loginTeacher.body.refresh;

  const loginStudent = await request(app)
    .post("/api/auth/login")
    .set("User-Agent", UA)
    .send({ name: studentName, pass: studentPass });
  expect(loginStudent.status).toBe(200);
  studentAccess = loginStudent.body.access;
});

afterAll(async () => {
  await prisma.users.updateMany({
    where: { name: { startsWith: PREFIX } },
    data: { classId: null },
  });

  await prisma.class.deleteMany({ where: { name: { startsWith: PREFIX } } });
  await prisma.course.deleteMany({ where: { name: { startsWith: PREFIX } } });
  await prisma.users.deleteMany({ where: { name: { startsWith: PREFIX } } });
  await prisma.refreshTokens.deleteMany({ where: { userAgent: { startsWith: PREFIX } } });

  await prisma.$disconnect();
});

describe("Auth негативные кейсы", () => {
  test("POST /api/auth/register без body -> 400", async () => {
    const res = await request(app).post("/api/auth/register").send({});
    expect(res.status).toBe(400);
  });

  test("POST /api/auth/register с пустым name -> 400", async () => {
    const res = await request(app).post("/api/auth/register").send({ name: "   ", pass: "x" });
    expect(res.status).toBe(400);
  });

  test("POST /api/auth/register с неверным типом pass -> 400", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: name("badpass"), pass: 123 });
    expect(res.status).toBe(400);
  });

  test("POST /api/auth/login с неверным паролем -> 401", async () => {
    const res = await request(app).post("/api/auth/login").send({ name: name("student"), pass: "wrong" });
    expect(res.status).toBe(401);
  });

  test("POST /api/auth/refresh без refresh -> 400", async () => {
    const res = await request(app).post("/api/auth/refresh").send({});
    expect(res.status).toBe(400);
  });

  test("POST /api/auth/refresh с мусорным refresh -> 401", async () => {
    const res = await request(app).post("/api/auth/refresh").send({ refresh: "not-a-jwt" });
    expect(res.status).toBe(401);
  });

  test("POST /api/auth/logout без refresh -> 400", async () => {
    const res = await request(app).post("/api/auth/logout").send({});
    expect(res.status).toBe(400);
  });

  test("POST /api/auth/logout с мусорным refresh -> 401", async () => {
    const res = await request(app).post("/api/auth/logout").send({ refresh: "not-a-jwt" });
    expect(res.status).toBe(401);
  });

  test("POST /api/auth/logout с валидным refresh -> 200", async () => {
    const res = await request(app).post("/api/auth/logout").send({ refresh: teacherRefresh });
    expect(res.status).toBe(200);
  });
});

describe("JWT и роли", () => {
  test("GET /api/courses без Authorization -> 401", async () => {
    const res = await request(app).get("/api/courses");
    expect(res.status).toBe(401);
  });

  test("GET /api/courses с пустым Bearer -> 401", async () => {
    const res = await request(app).get("/api/courses").set("Authorization", "Bearer");
    expect(res.status).toBe(401);
  });

  test("POST /api/courses со student token -> 403", async () => {
    const res = await request(app)
      .post("/api/courses")
      .set("Authorization", `Bearer ${studentAccess}`)
      .send({ name: name("course_forbidden"), description: "x", duration: 1 });

    expect(res.status).toBe(403);
  });
});

describe("Courses валидация и границы", () => {
  test("POST /api/courses duration строкой-числом -> 200 (тихая коэрция типа)", async () => {
    const res = await request(app)
      .post("/api/courses")
      .set("Authorization", `Bearer ${teacherAccess}`)
      .send({ name: name("course_bad_duration"), description: "x", duration: "123" });

    expect(res.status).toBe(200);
  });

  test("POST /api/courses duration строкой-нечислом -> 400", async () => {
    const res = await request(app)
      .post("/api/courses")
      .set("Authorization", `Bearer ${teacherAccess}`)
      .send({ name: name("course_bad_duration_nan"), description: "x", duration: "abc" });

    expect(res.status).toBe(400);
  });

  test("POST /api/courses name числом -> 400", async () => {
    const res = await request(app)
      .post("/api/courses")
      .set("Authorization", `Bearer ${teacherAccess}`)
      .send({ name: 123, description: "x", duration: 1 });

    expect(res.status).toBe(400);
  });

  test("GET /api/courses/not-a-number -> 400", async () => {
    const res = await request(app)
      .get("/api/courses/not-a-number")
      .set("Authorization", `Bearer ${teacherAccess}`);

    expect(res.status).toBe(400);
  });

  test("GET /api/courses/999999999 -> 404", async () => {
    const res = await request(app).get("/api/courses/999999999").set("Authorization", `Bearer ${teacherAccess}`);
    expect(res.status).toBe(404);
  });

  test("PATCH /api/courses/not-a-number -> 400", async () => {
    const res = await request(app)
      .patch("/api/courses/not-a-number")
      .set("Authorization", `Bearer ${teacherAccess}`)
      .send({ parameter: "duration", value: 10 });

    expect(res.status).toBe(400);
  });

  test("PATCH /api/courses/:id с запрещенным parameter -> 400", async () => {
    const created = await request(app)
      .post("/api/courses")
      .set("Authorization", `Bearer ${teacherAccess}`)
      .send({ name: name("course_for_patch"), description: "x", duration: 1 });
    expect(created.status).toBe(200);

    const list = await request(app).get("/api/courses").set("Authorization", `Bearer ${teacherAccess}`);
    expect(list.status).toBe(200);

    const id = list.body.find((c: any) => c?.name === name("course_for_patch"))?.id;
    expect(typeof id).toBe("number");

    const res = await request(app)
      .patch(`/api/courses/${id}`)
      .set("Authorization", `Bearer ${teacherAccess}`)
      .send({ parameter: "id", value: 123 });

    expect(res.status).toBe(400);
  });

  test("DELETE /api/courses/999999999 -> 400 (ошибка БД)", async () => {
    const res = await request(app).delete("/api/courses/999999999").set("Authorization", `Bearer ${teacherAccess}`);
    expect(res.status).toBe(400);
  });
});

describe("Classes потенциальные краши (плохая валидация)", () => {
  test("POST /api/classes без name -> 500 (TypeError на trim)", async () => {
    const res = await request(app).post("/api/classes").set("Authorization", `Bearer ${teacherAccess}`).send({});
    expect(res.status).toBe(500);
  });

  test("PATCH /api/classes/:id без name -> 500 (TypeError на toString)", async () => {
    const created = await request(app)
      .post("/api/classes")
      .set("Authorization", `Bearer ${teacherAccess}`)
      .send({ name: name("class_ok") });
    expect(created.status).toBe(201);

    const res = await request(app)
      .patch(`/api/classes/${created.body.id}`)
      .set("Authorization", `Bearer ${teacherAccess}`)
      .send({});
    expect(res.status).toBe(500);
  });

  test("POST /api/classes/:classId/courses без courseId -> 400", async () => {
    const created = await request(app)
      .post("/api/classes")
      .set("Authorization", `Bearer ${teacherAccess}`)
      .send({ name: name("class_for_connect") });
    expect(created.status).toBe(201);

    const res = await request(app)
      .post(`/api/classes/${created.body.id}/courses`)
      .set("Authorization", `Bearer ${teacherAccess}`)
      .send({});
    expect(res.status).toBe(400);
  });
});
