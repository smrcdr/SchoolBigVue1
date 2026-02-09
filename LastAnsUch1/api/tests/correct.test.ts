import request from "supertest";
import {app} from "../app";
import {prisma} from "../../lib/prisma";


let refreshToken = ""
let accessToken = ""

let classGet = {
    id: -1
}

let course = {
    id: -1
}

describe("Пинг", () => {
    test("GET /api/ping", async () => {
        const res = await request(app).get("/api/ping");

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ status: "ok" });
    });
});


describe("Авторизация", () => {
    test("POST /api/auth/register - Создание ученика", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                name: "SmartestJS",
                pass: "EzzAvtomat",
                invite: "Неверный инвайт"
            });

        expect(res.status).toBe(201);
        expect(res.body).toMatchObject({ id: expect.any(Number), name: "SmartestJS", role: "student" });
    });

    test("POST /api/auth/register - Создание учителя", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                name: "roctbb",
                pass: "777",
                invite: "SmartestJS_Yghfjih@/f"
            });

        expect(res.status).toBe(201);
        expect(res.body).toMatchObject({ id: expect.any(Number), name: "roctbb", role: "teacher" });
    });

    test("POST /api/auth/login - Логин ученика", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({
                name: "SmartestJS",
                pass: "EzzAvtomat",
            });

        refreshToken = res.body?.refresh.toString();
        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({ access: expect.any(String), refresh: expect.any(String) });
    });

    test("POST /api/auth/refresh - Обновление токена", async () => {
        const res = await request(app)
            .post("/api/auth/refresh")
            .send({
                refresh: refreshToken
            });

        refreshToken = res.body?.refresh.toString();
        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({ access: expect.any(String), refresh: expect.any(String) });
    });

    test("POST /api/auth/logout - Выход ученика", async () => {
        const res = await request(app)
            .post("/api/auth/logout")
            .send({
                refresh: refreshToken,
            });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ status: "ok" });
    });

    test("POST /api/auth/login - Логин учителя", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({
                name: "roctbb",
                pass: "777",
            });

        accessToken = res.body?.access.toString();

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({ access: expect.any(String), refresh: expect.any(String) })
    });
});


describe("Курсы корректные запросы", () => {
    test("POST /api/courses - Создание курса", async () => {
        const res = await request(app)
            .post("/api/courses")
            .send({
                name: "SilaederWeb",
                description: "SuperCode",
                duration: 123
            })
            .set("Authorization", `Bearer ${accessToken}`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual(
            {
                name: "SilaederWeb",
                description: "SuperCode",
                duration: 123,
            id: expect.any(Number)});
    });

    test("GET /api/courses - Получение всех курсов", async () => {
        const res = await request(app)
            .get("/api/courses")
            .set("Authorization", `Bearer ${accessToken}`);

        course = res.body[0]

        expect(res.status).toBe(200);
        expect(res.body[0]).toMatchObject({"description": "SuperCode", "duration": 123, "id": expect.any(Number)});
    });

    test(`GET /api/courses/:id - Получение курса по id`, async () => {
        const res = await request(app)
            .get(`/api/courses/${course.id}`)
            .set("Authorization", `Bearer ${accessToken}`);

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({"description": "SuperCode", "duration": 123, "id": expect.any(Number), "name": "SilaederWeb"});
    });

    test(`PATCH /api/courses/:id - Изменение курса по id`, async () => {
        const res = await request(app)
            .patch(`/api/courses/${course.id}`)
            .send({parameter: "duration", value: 321})
            .set("Authorization", `Bearer ${accessToken}`);



        expect(res.status).toBe(200);
        expect(res.body).toEqual({status: "ok"});



        const res1 = await request(app)
            .get(`/api/courses/${course.id}`)
            .set("Authorization", `Bearer ${accessToken}`);

        expect(res1.status).toBe(200);
        expect(res1.body).toMatchObject({"description": "SuperCode", "duration": 321, "id": expect.any(Number), "name": "SilaederWeb"});
    });

    test(`DELETE /api/courses/:id - Удаление курса по id`, async () => {
        const res = await request(app)
            .get(`/api/courses/${course.id}`)
            .set("Authorization", `Bearer ${accessToken}`);

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({"description": "SuperCode", "duration": 321, "id": expect.any(Number), "name": "SilaederWeb"});

        const res1 = await request(app)
            .delete(`/api/courses/${course.id}`)
            .set("Authorization", `Bearer ${accessToken}`);

        expect(res1.status).toBe(204);

        const res2 = await request(app)
            .get(`/api/courses/${course.id}`)
            .set("Authorization", `Bearer ${accessToken}`);

        expect(res2.status).toBe(404);



    });
});

describe("Классы корректные запросы", () => {
    test("POST /api/classes - Создание класса", async () => {
        const res = await request(app)
            .post("/api/classes")
            .send({
                name: "10C"
            })
            .set("Authorization", `Bearer ${accessToken}`);

        classGet = res.body

        expect(res.status).toBe(201);
        expect(res.body).toMatchObject({ id: expect.any(Number), name: "10C"});
    });

    test("GET /api/classes - Получение всех классов", async () => {
        const res = await request(app)
            .get("/api/classes")
            .set("Authorization", `Bearer ${accessToken}`);


        expect(res.status).toBe(200);
        expect(res.body).toMatchObject([{"name": "10C", "id": expect.any(Number)}]);
    });

    test("GET /api/classes/:classId - Получение класса по id", async () => {
        const res = await request(app)
            .get(`/api/classes/${classGet.id}`)
            .set("Authorization", `Bearer ${accessToken}`);


        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({"name": "10C", "id": expect.any(Number)});
    });

    test(`PATCH /api/classes/:classId - Изменение класса по id`, async () => {
        const res = await request(app)
            .patch(`/api/classes/${classGet.id}`)
            .send({name: "10CT"})
            .set("Authorization", `Bearer ${accessToken}`);


        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({"name": "10CT", "id": expect.any(Number)});


        const res1 = await request(app)
            .get(`/api/classes/${classGet.id}`)
            .set("Authorization", `Bearer ${accessToken}`);

        expect(res1.status).toBe(200);
        expect(res1.body).toMatchObject({"id": expect.any(Number), "name": "10CT"});
    });

    test("POST /api/classes/:classId/courses - Прикрепление курса к классу", async () => {
        const res = await request(app)
            .post("/api/courses")
            .send({
                name: "SilaederWeb2",
                description: "SuperCode2",
                duration: 1234
            })
            .set("Authorization", `Bearer ${accessToken}`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual(
            {
                name: "SilaederWeb2",
                description: "SuperCode2",
                duration: 1234,
                id: expect.any(Number)
            }
        );

        course = res.body

        const res1 = await request(app)
            .post(`/api/classes/${classGet.id}/courses`)
            .send({courseId: course.id})
            .set("Authorization", `Bearer ${accessToken}`);


        expect(res1.status).toBe(201);
        expect(res1.body).toMatchObject({status: "ok"});
    });

    test("POST /api/classes/:classId/courses - Открепление курса от класса", async () => {
        const res1 = await request(app)
            .delete(`/api/classes/${classGet.id}/courses/${course.id}`)
            .set("Authorization", `Bearer ${accessToken}`);

        expect(res1.status).toBe(204);

        const res = await request(app)
            .get(`/api/classes/${classGet.id}/${course.id}`)
            .set("Authorization", `Bearer ${accessToken}`);

        expect(res.status).toBe(404);
    });
});

afterAll(async () => {

    await prisma.class.deleteMany()
    await prisma.users.deleteMany()
    await prisma.course.deleteMany()
    await prisma.refreshTokens.deleteMany()
    await prisma.$disconnect()
})
