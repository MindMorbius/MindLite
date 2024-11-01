import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const LINUX_DO_CLIENT_ID = 'bEQBiJxMO4kGpkmFLPmOrKnHoJ6cB0iG'
const LINUX_DO_CLIENT_SECRET = 'v5lhTEgvCTEqxebtDoG9Z5r8ngqrXZDd'
const REDIRECT_URI = 'https://note.rkpin.site/api/auth/linux-do/callback'
const SITE_URL = 'https://note.rkpin.site'

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  
  try {
    // 1. Exchange code for token
    const tokenResponse = await fetch('https://connect.linux.do/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: LINUX_DO_CLIENT_ID,
        client_secret: LINUX_DO_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI
      })
    })
    const tokenData = await tokenResponse.json()

    // 2. Get user info
    const userResponse = await fetch('https://connect.linux.do/api/user', {
      headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
    })
    const userData = await userResponse.json()

    // 3. Sign in with Supabase using custom token
    const { data: { user }, error } = await supabase.auth.signInWithOAuth({
      provider: 'linux_do',
      options: {
        queryParams: {
          access_token: tokenData.access_token,
          user_metadata: {
            avatar_url: userData.avatar_url,
            full_name: userData.name,
            user_name: userData.username,
            email: userData.email,
            linux_do_id: userData.id,
            trust_level: userData.trust_level,
            active: userData.active,
            last_sign_in: new Date().toISOString()
          }
        }
      }
    })

    if (error) throw error
    
    return NextResponse.redirect(`${SITE_URL}/workspace`)
  } catch (error) {
    console.error('OAuth error:', error)
    return NextResponse.redirect(`${SITE_URL}/auth/error`)
  }
} 