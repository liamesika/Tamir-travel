import { prisma } from './prisma'
import bcrypt from 'bcrypt'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function createAdmin(email: string, password: string, name: string) {
  const hashedPassword = await hashPassword(password)

  return prisma.admin.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
  })
}

export async function validateAdmin(email: string, password: string) {
  const admin = await prisma.admin.findUnique({
    where: { email },
  })

  if (!admin) {
    return null
  }

  const isValid = await verifyPassword(password, admin.password)

  if (!isValid) {
    return null
  }

  return {
    id: admin.id,
    email: admin.email,
    name: admin.name,
  }
}
