import { handleAuth } from '@kinde-oss/kinde-auth-nextjs/server'
import { NextRequest } from 'next/server'


interface AuthParams {
  params: {
    kindeAuth: string
  }
}


export async function GET(
  request: NextRequest,
  { params }: AuthParams
) {
  const endpoint = params.kindeAuth
  return handleAuth(request, endpoint)
}