import { getProfile, requireAuth } from '../../../../lib/auth'

import { NextResponse } from 'next/server'

export async function GET(req: Request) {
    const username = requireAuth(req)
    if (typeof username !== 'string') return username
    const profile = getProfile(username)
    return NextResponse.json({ username, profile })
}

export async function POST(req: Request) {
    const username = requireAuth(req)
    if (typeof username !== 'string') return username
    const body = await req.json()
    try {
        // lazy import to avoid circular
        const { setProfile } = await import('../../../../lib/auth')
        setProfile(username, { name: body.name, email: body.email, contact: body.contact })
        return NextResponse.json({ ok: true })
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 })
    }
}
