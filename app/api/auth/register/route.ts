import { NextResponse } from 'next/server'
import { addUser } from '../../../../lib/auth'

export async function POST(request: Request) {
    const body = await request.json()
    if (!body.username || !body.password) return NextResponse.json({ error: 'missing' }, { status: 400 })
    try {
        addUser(body.username, body.password)
        return NextResponse.json({ ok: true })
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 400 })
    }
}
