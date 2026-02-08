import {prisma} from "./lib/prisma";


await prisma.class.deleteMany()
await prisma.users.deleteMany()
await prisma.course.deleteMany()
await prisma.refreshTokens.deleteMany()