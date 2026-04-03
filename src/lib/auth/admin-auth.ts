import { NextRequest } from 'next/server'
import { SignJWT, jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET || 'your-secret-key')

export interface AdminPayload {
  adminId: string
  username: string
  email: string
}

export async function verifyAdminToken(token: string): Promise<AdminPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return {
      adminId: payload.adminId as string,
      username: payload.username as string,
      email: payload.email as string
    }
  } catch {
    return null
  }
}

export async function createAdminToken(payload: Omit<AdminPayload, 'iat' | 'exp'>): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET)
}

export async function getAdminFromRequest(request: NextRequest): Promise<AdminPayload | null> {
  const token = request.cookies.get('admin-token')?.value

  if (!token) {
    return null
  }

  return verifyAdminToken(token)
}

export async function isAdminAuthenticated(request: NextRequest): Promise<boolean> {
  const admin = await getAdminFromRequest(request)
  return admin !== null
}