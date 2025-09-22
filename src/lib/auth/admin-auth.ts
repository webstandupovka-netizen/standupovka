import { NextRequest } from 'next/server'
import { SignJWT, jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET || 'your-secret-key')

export interface AdminPayload {
  adminId: string
  username: string
  email: string
}

// Simple token verification for Edge Runtime
export function verifyAdminTokenSimple(token: string): AdminPayload | null {
  try {
    // Simple base64 decode for development - NOT for production
    const parts = token.split('.')
    if (parts.length !== 3) return null
    
    const payload = JSON.parse(atob(parts[1]))
    
    // Check if token is expired
    if (payload.exp && payload.exp < Date.now() / 1000) {
      console.log('Token expired')
      return null
    }
    
    console.log('Token verification success:', { username: payload.username })
    return {
      adminId: payload.adminId,
      username: payload.username,
      email: payload.email
    }
  } catch (error) {
    console.log('Token verification failed:', error)
    return null
  }
}

export async function verifyAdminToken(token: string): Promise<AdminPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    console.log('Token verification success:', { username: payload.username })
    return {
      adminId: payload.adminId as string,
      username: payload.username as string,
      email: payload.email as string
    }
  } catch (error) {
    console.log('Token verification failed:', error)
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

export function getAdminFromRequest(request: NextRequest): AdminPayload | null {
  const token = request.cookies.get('admin-token')?.value
  
  console.log('Admin auth debug:', {
    hasToken: !!token,
    tokenLength: token?.length,
    cookies: Object.fromEntries(request.cookies.getAll().map(c => [c.name, c.value?.substring(0, 20) + '...']))
  })
  
  if (!token) {
    return null
  }
  
  return verifyAdminTokenSimple(token)
}

export function isAdminAuthenticated(request: NextRequest): boolean {
  const admin = getAdminFromRequest(request)
  return admin !== null
}