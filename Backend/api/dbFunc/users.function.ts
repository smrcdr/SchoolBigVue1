import {prisma} from '../../lib/prisma'
import bcrypt from "bcrypt"

const usersFunc = {

    create: async (name: string, pass: string, role: string) => {
        const hash = await bcrypt.hash(pass, 10)
        return prisma.users.create({

            data: {
                name,
                role,
                hash
            }
        })
    },

    getByName: async (name: string) => {
        return prisma.users.findFirst({
            where: {
                name
            }
        })
    },

    getUser: async (id: number)=> {
        return prisma.users.findFirst({
            where: {
                id
            }
        })
    }

}

export default usersFunc
