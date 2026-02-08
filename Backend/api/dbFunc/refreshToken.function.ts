import {prisma} from '../../lib/prisma'
import bcrypt from "bcrypt";

export async function create(token: string, ip: string | undefined, userAgent: string | undefined) {
    const hash = await bcrypt.hash(token, 10)
    return prisma.refreshTokens.create({
        data: {
            hash,
            ip,
            userAgent
        }
    })
}

export async function findActiveByToken(token: string) {
    const candidates = await prisma.refreshTokens.findMany({
        where: { work: true },
        select: { id: true, hash: true }
    })

    for (const row of candidates) {
        const ok = await bcrypt.compare(token, row.hash)
        if (ok) return row
    }

    return null
}

export async function revoke(id: number) {
    return prisma.refreshTokens.update({
        where: { id },
        data: { work: false }
    })
}
