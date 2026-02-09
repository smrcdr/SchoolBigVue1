import {prisma} from '../../lib/prisma'

const classFunc = {

    create: async (name: string) => {
        const r = await prisma.class.create({
            data: {
                name
            }
        })
        return r
    },

    delete: async (id: number) => {
        const r = await prisma.class.delete({
            where: {
                id
            }
        })
        return r
    },

    changeName: async (id: number, name: string) => {
        const r = await prisma.class.update({
            where: {
                id
            },
            data: {
                name
            }
        })
        return r
    },

    addUserInClass: async (userId: number, classId: number) => {
        const r = await prisma.users.update({
            where: {
                id: userId
            },
            data: {
                class: {
                    connect: {
                        id: classId
                    }
                }
            }
        })
        return r
    },

    deleteUserInClass: async (userId: number) => {
        const r = await prisma.users.update({
            where: {
                id: userId
            },
            data: {
                class: {
                    disconnect: true
                }
            }
        })
        return r
    },


    getAllUsersNotInClass: async () => {
        const r = await prisma.users.findMany({
            where: {
                classId: null
            }
        })

        return r
    },

    connectCourseAtClass: async (courseId: number, classId: number) => {
        const r = await prisma.class.update({
            where: {
                id: classId
            },
            data: {
                courses: {
                    connect: {id: courseId}
                }
            }
        })
        return r
    },
    deleteCourseAtClass: async (courseId: number, classId: number) => {
        const r = await prisma.class.update({
            where: {
                id: classId
            },
            data: {
                courses: {
                    disconnect: {id: courseId}
                }
            }
        })
        return r
    },

    getAllClasses: async () => {
        return await prisma.class.findMany()
    },

    getClassById: async (id: number) => {
        return await prisma.class.findFirst({
            where: {id}
        })
    }

}


export default classFunc