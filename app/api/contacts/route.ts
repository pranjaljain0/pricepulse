import { queryFlux, writePoint } from '../../../lib/influx'

import { NextResponse } from 'next/server'

type Contact = {
    id: string
    name?: string
    company?: string
    designation?: string
    birthday?: string
    contact_number?: string
    email?: string
    other_details?: string
    _time?: string
}

export async function GET() {
    const flux = `from(bucket: "${process.env.INFLUXDB_BUCKET}")
    |> range(start: -30d)
    |> filter(fn: (r) => r._measurement == "contacts")
    |> sort(columns: ["_time"])`

    const raw = await queryFlux<Record<string, unknown>>(flux)
    const grouped = new Map<string, Map<string, Record<string, unknown>>>()
    raw.forEach((r) => {
        if (!r) return
        const id = (typeof r.id === 'string' || typeof r.id === 'number') ? String(r.id) : ''
        if (!id) return
        const t = typeof r._time === 'string' ? r._time : (r._time ? String(r._time) : '')
        if (!t) return
        const field = typeof r._field === 'string' ? r._field : undefined
        if (!field) return
        const val = Object.prototype.hasOwnProperty.call(r, '_value') ? (r as Record<string, unknown>)['_value'] : undefined

        const byId = grouped.get(id) ?? new Map<string, Record<string, unknown>>()
        grouped.set(id, byId)
        const atTime = (byId.get(t) as Record<string, unknown>) ?? { id, _time: t } as Record<string, unknown>
        atTime[field] = val
        byId.set(t, atTime)
    })

    const result: Contact[] = []
    grouped.forEach((byTime) => {
        let latestTime = ''
        let latestObj: Record<string, unknown> | null = null
        byTime.forEach((obj, time) => {
            if (!latestTime || new Date(time) > new Date(latestTime)) {
                latestTime = time
                latestObj = obj
            }
        })
        if (latestObj) {
            const deletedVal = latestObj['deleted']
            if (deletedVal !== true) {
                result.push(latestObj as Contact)
            }
        }
    })

    return NextResponse.json(result)
}

export async function POST(request: Request) {
    const body = await request.json()
    if (!body.name || !body.contact_number) {
        return NextResponse.json({ error: 'name and contact_number are required' }, { status: 400 })
    }
    const id = body.id ? String(body.id) : String(Date.now())
    await writePoint('contacts', { id }, {
        name: body.name || '',
        company: body.company || '',
        designation: body.designation || '',
        birthday: body.birthday || '',
        contact_number: body.contact_number || '',
        email: body.email || '',
        other_details: body.other_details || '',
        deleted: false
    })
    return NextResponse.json({ id })
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'missing id' }, { status: 400 })
    const url = `${process.env.INFLUXDB_URL}/api/v2/delete?org=${process.env.INFLUXDB_ORG}&bucket=${process.env.INFLUXDB_BUCKET}`
    const token = process.env.INFLUXDB_TOKEN
    if (!token) return NextResponse.json({ error: 'missing influx token' }, { status: 500 })

    const body = {
        start: '1970-01-01T00:00:00Z',
        stop: new Date().toISOString(),
        predicate: `_measurement="contacts" AND id="${id}"`
    }

    await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })

    return NextResponse.json({ id })
}
