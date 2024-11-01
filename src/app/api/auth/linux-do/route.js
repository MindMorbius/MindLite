import { NextResponse } from 'next/server'

const LINUX_DO_CLIENT_ID = 'bEQBiJxMO4kGpkmFLPmOrKnHoJ6cB0iG'
const REDIRECT_URI = 'https://note.rkpin.site/api/auth/linux-do/callback'

export async function GET() {
  const authUrl = `https://connect.linux.do/oauth2/authorize?` + 
    `client_id=${LINUX_DO_CLIENT_ID}&` +
    `redirect_uri=${REDIRECT_URI}&` +
    `response_type=code&` +
    `scope=openid`

  return NextResponse.redirect(authUrl)
} 