import { addUser, hasUsers, issueToken, verifyUser } from '../../../../lib/auth'

import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const body = await request.json()
    if (!body.username || !body.password) return NextResponse.json({ error: 'missing' }, { status: 400 })
    // If no users exist yet, allow default admin/admin and create the admin user.
    if (!hasUsers()) {
        if (body.username === 'admin' && body.password === 'admin') {
            try {
                addUser('admin', 'admin')
            } catch {
                // ignore if creation race or other error; fall through to verify
            }
        } else {
            return NextResponse.json({ error: 'invalid' }, { status: 401 })
        }
    }
    const ok = verifyUser(body.username, body.password)
    if (!ok) return NextResponse.json({ error: 'invalid' }, { status: 401 })
    const token = issueToken(body.username)
    const res = NextResponse.json({ ok: true, hasUsers: true })
    // set HttpOnly cookie via NextResponse API
    res.cookies.set({ name: 'session', value: token, httpOnly: true, path: '/', sameSite: 'lax' })
    return res
}
