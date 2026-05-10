/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { prisma } from '@/lib/prisma'
import { setSession, hashPassword, comparePassword } from '@/utils/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  avatarBase64: z.string().optional(),
})

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const avatarBase64 = formData.get('avatarBase64') as string

  const parsed = loginSchema.safeParse({ email, password, avatarBase64 })
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return { error: 'Invalid email or password' }
  }

  const isValid = await comparePassword(password, user.passwordHash)
  if (!isValid) {
    return { error: 'Invalid email or password' }
  }

  if (avatarBase64 && avatarBase64 !== user.avatarBase64) {
    await prisma.user.update({
      where: { id: user.id },
      data: { avatarBase64 }
    })
  }
  await setSession(user.id)

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  avatarBase64: z.string().optional(),
  additionalInfo: z.string().optional(),
  role: z.enum(['user', 'admin']).default('user'),
})

export async function signupAction(prevState: any, formData: FormData) {
  const data = {
    firstName: formData.get('firstName') as string,
    lastName: formData.get('lastName') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string,
    city: formData.get('city') as string,
    country: formData.get('country') as string,
    password: formData.get('password') as string,
    avatarBase64: formData.get('avatarBase64') as string,
    additionalInfo: formData.get('additionalInfo') as string,
    role: (formData.get('role') as string) || 'user',
  }

  const parsed = registerSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const existingUser = await prisma.user.findUnique({ where: { email: data.email } })
  if (existingUser) {
    return { error: 'Email already in use' }
  }

  const passwordHash = await hashPassword(data.password)

  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone || null,
      city: data.city || null,
      country: data.country || null,
      role: data.role || 'user',
      avatarBase64: data.avatarBase64 || null,
      additionalInfo: data.additionalInfo || null,
    }
  })


  await setSession(user.id)

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function resetPasswordAction(prevState: any, formData: FormData) {
  const email = formData.get('email') as string

  if (!email || !z.string().email().safeParse(email).success) {
    return { error: 'Please enter a valid email address' }
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return { success: 'If an account exists, you will receive an email with reset instructions.' }
  }
  console.log(`[HACKATHON] Local password reset link generated for: ${email}`)

  return { success: 'If an account exists, you will receive an email with reset instructions.' }
}

export async function logoutAction() {
  const { clearSession } = await import('@/utils/auth')
  await clearSession()
  redirect('/login')
}
