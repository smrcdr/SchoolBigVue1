import {prisma} from '../../lib/prisma'

const courseFunc = {
    async addCourse(name :string, description :string, duration :number) {
        return prisma.course.create({
            data: {
                name: name,
                description: description,
                duration: duration
            }
        });
    },

    async getCourses() {
        return prisma.course.findMany();
    },

    async getCourse(id :number) {
        return prisma.course.findFirst(
            {
                where: {
                    id: id
                }
            }
        );
    },

    async deleteCourse(id :number) {
        return prisma.course.delete({
            where: {
                id: id
            }
        });
    },

    async updateCourse(id :number, column :string, value :unknown) {
        return prisma.course.update({
            where: {
                id: id
            },
            data: {
                [column]: value
            }
        });
    }
}


export default courseFunc
