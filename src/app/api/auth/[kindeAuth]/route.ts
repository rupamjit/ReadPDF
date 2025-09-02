import { handleAuth } from '@kinde-oss/kinde-auth-nextjs/server';

export async function GET(
  request: Request,
  { params }: any
) {
  const result =  handleAuth(request, params.kindeAuth);
  return result;
}