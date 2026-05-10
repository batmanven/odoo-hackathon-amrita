import { NextResponse, NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const secretKey = process.env.JWT_SECRET || 'super-secret-key-for-hackathon-only-replace-me'
const key = new TextEncoder().encode(secretKey)

async function decrypt(input: string) {
    try {
        const { payload } = await jwtVerify(input, key, {
            algorithms: ['HS256'],
        })
        return payload
    } catch {
        return null
    }
}

export async function proxy(request: NextRequest) {
    const session = request.cookies.get('session')?.value
    const { pathname } = request.nextUrl

    const isAuthRoute = pathname === '/login' || pathname === '/register'
    const isProtectedRoute = pathname.startsWith('/dashboard')

    if (isAuthRoute && session) {
        const payload = await decrypt(session)
        if (payload) {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
    }

    if (isProtectedRoute && !session) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    return NextResponse.next()
}
export const config = {
    matcher: ['/dashboard/:path*', '/login', '/register'],
}
