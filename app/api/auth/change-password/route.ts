import { requireAuth, setPassword } from '../../../../lib/auth'

import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    const username = requireAuth(req)
    if (typeof username !== 'string') return username
    const body = await req.json()
    if (!body.password) return NextResponse.json({ error: 'missing' }, { status: 400 })
    try {
        setPassword(username, body.password)
        return NextResponse.json({ ok: true })
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 400 })
    }
}
