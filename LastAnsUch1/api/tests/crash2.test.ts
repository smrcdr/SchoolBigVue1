import request from "supertest";
import {app} from "../app";
import {prisma} from "../../lib/prisma";


let refreshToken = ""
let accessToken = ""
let accessTokenStudent = ""

let student = {
    name: "SmartestJS1",
    pass: "123123123"
}

let teacher = {
    name: "roctbb1",
    pass: "uarhgeuhirythgufirytygh",
    secretInvite: "SmartestJS_Yghfjih@/f"
}


let classGet = {
    id: -1
}

let course = {
    id: -1
}


function f() {

}


describe("Пинг", () => {
    test("GET /api/ping", async () => {
        const res = await request(app).get("/api/ping");

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ status: "ok" });
    });
});

describe("Авторизация", () => {
    test("POST /api/auth/register - Создание пользователя с неверным паролем", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                name: "SmartestJS",
                pass: true
            });

        expect(res.status).toBe(400);
    });

    test("POST /api/auth/register - Создание пользователя без имени", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                pass: "777",
                invite: "SmartestJS_Yghfjih@/f"
            });

        expect(res.status).toBe(400);
    });

    test("POST /api/auth/register - Создание пользователя с занятым именем", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send(
                student
            );

        expect(res.status).toBe(201);

        const res2 = await request(app)
            .post("/api/auth/register")
            .send(
                student
            );

        expect(res2.status).toBe(409);
    });


    test("POST /api/auth/login - Логин с неверным паролем", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({
                name: "SmartestJS1",
                pass: "EzzAvtomat",
            });

        expect(res.status).toBe(401);
    });

    test("POST /api/auth/refresh - Попытка обновить токен с неверным токеном", async () => {
        const res = await request(app)
            .post("/api/auth/refresh")
            .send({
                refresh: "123"
            });

        expect(res.status).toBe(401);
    });

    test("POST /api/auth/logout - Попытка выйти с неверным токеном", async () => {
        const res = await request(app)
            .post("/api/auth/logout")
            .send({
                refresh: "123123",
            });

        expect(res.status).toBe(401);
    });

});

describe("Курсы", () => {
    test("POST /api/courses - Создание курса без обязательного поля", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                name: "roctbb2",
                pass: "777",
                invite: "SmartestJS_Yghfjih@/f"
            });

        expect(res.status).toBe(201);
        expect(res.body).toMatchObject({ id: expect.any(Number), name: "roctbb2", role: "teacher" });


        const res2 = await request(app)
            .post("/api/auth/login")
            .send({
                name: "roctbb2",
                pass: "777",
            });

        accessToken = res2.body?.access.toString();

        expect(res2.status).toBe(200);
        expect(res2.body).toMatchObject({ access: expect.any(String), refresh: expect.any(String) })


        const res1 = await request(app)
            .post("/api/courses")
            .send({
                name: "SilaederWeb",
                description: "SuperCode",
            })
            .set("Authorization", `Bearer ${accessToken}`);

        expect(res1.status).toBe(400);


        const res3 = await request(app)
            .post("/api/courses")
            .send({
                name: "SilaederWeb",
                duration: 12312
            })
            .set("Authorization", `Bearer ${accessToken}`);

        expect(res3.status).toBe(400);


        const res4 = await request(app)
            .post("/api/courses")
            .send({
                description: "SuperCode",
                duration: 12312
            })
            .set("Authorization", `Bearer ${accessToken}`);

        expect(res4.status).toBe(400);

    });

    test("POST /api/courses - Создание курса учеником", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                name: "roctbb23",
                pass: "777",
                invite: "SmartestdJS_Yghfjih@/f"
            });

        expect(res.status).toBe(201);
        expect(res.body).toMatchObject({ id: expect.any(Number), name: "roctbb23", role: "student" });


        const res2 = await request(app)
            .post("/api/auth/login")
            .send({
                name: "roctbb23",
                pass: "777",
            });

        accessTokenStudent = res2.body?.access.toString();

        expect(res2.status).toBe(200);
        expect(res2.body).toMatchObject({ access: expect.any(String), refresh: expect.any(String) })


        const res1 = await request(app)
            .post("/api/courses")
            .send({
                name: "SilaederWeb1",
                description: "SuperCode1",
            })
            .set("Authorization", `Bearer ${accessTokenStudent}`);

        expect(res1.status).toBe(403);


    });

    test(`GET /api/courses/:id - Получение курса по id которого нет`, async () => {
        const res = await request(app)
            .get(`/api/courses/525252`)
            .set("Authorization", `Bearer ${accessToken}`);

        expect(res.status).toBe(404);
    });

    test(`PATCH /api/courses/:id - Изменение курса по параметру которого нет`, async () => {
        const res = await request(app)
            .patch(`/api/courses/${course.id}`)
            .send({parameter: "duuration", value: 321})
            .set("Authorization", `Bearer ${accessToken}`);



        expect(res.status).toBe(400);

    });

    test(`DELETE /api/courses/:id - Удаление курса по id которого нет`, async () => {

        const res1 = await request(app)
            .delete(`/api/courses/1234123`)
            .set("Authorization", `Bearer ${accessToken}`);

        expect(res1.status).toBe(400);

    });
});


describe("Классы", () => {
    test("POST /api/classes - Создание класса без имени", async () => {
        const res = await request(app)
            .post("/api/classes")
            .send({
                names: "10C"
            })
            .set("Authorization", `Bearer ${accessToken}`);


        expect(res.status).toBe(400);
    });

    test("GET /api/classes/:classId - Получение класса по id которого нет", async () => {
        const res = await request(app)
            .get(`/api/classes/-24352`)
            .set("Authorization", `Bearer ${accessToken}`);


        expect(res.status).toBe(404);
    });


    test(`PATCH /api/classes/:classId - Изменение класса по id которого нет`, async () => {
        const res = await request(app)
            .patch(`/api/classes/-1212`)
            .send({name: "10CT"})
            .set("Authorization", `Bearer ${accessToken}`);


        expect(res.status).toBe(404);

    });

});


/*afterAll(async () => {

    await prisma.class.deleteMany()
    await prisma.users.deleteMany()
    await prisma.course.deleteMany()
    await prisma.refreshTokens.deleteMany()
    await prisma.$disconnect()
})*/