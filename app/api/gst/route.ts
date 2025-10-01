import { queryFlux, writePoint } from '../../../lib/influx'

import { NextResponse } from 'next/server'
import { requireAuth } from '../../../lib/auth'

type GST = {
    id: string
    gstNumber?: string
    businessName?: string
    other_details?: string
    _time?: string
}

export async function GET(request: Request) {
    const auth = requireAuth(request)
    if (typeof auth !== 'string') return auth
    const flux = `from(bucket: "${process.env.INFLUXDB_BUCKET}")
    |> range(start: -30d)
    |> filter(fn: (r) => r._measurement == "gst_info")
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

    const result: GST[] = []
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
                // owner may be present as a tag on some rows; only include if owner matches
                const owner = typeof latestObj['owner'] === 'string' ? latestObj['owner'] : undefined
                if (!owner || owner === auth) {
                    result.push(latestObj as GST)
                }
            }
        }
    })

    return NextResponse.json(result)
}

export async function POST(request: Request) {
    const auth = requireAuth(request)
    if (typeof auth !== 'string') return auth
    const body = await request.json()
    if (!body.gstNumber || !body.businessName) {
        return NextResponse.json({ error: 'gstNumber and businessName are required' }, { status: 400 })
    }
    // basic GST format check (very permissive)
    if (!/^\d{2}[A-Z0-9]{13}$/.test(body.gstNumber)) {
        // don't block strictly, but warn — return 400 to enforce
        return NextResponse.json({ error: 'invalid gstNumber format' }, { status: 400 })
    }
    const id = body.id ? String(body.id) : String(Date.now())
    await writePoint('gst_info', { id, owner: auth }, {
        gstNumber: body.gstNumber || '',
        businessName: body.businessName || '',
        other_details: body.other_details || '',
        deleted: false
    })
    return NextResponse.json({ id })
}

export async function DELETE(request: Request) {
    const auth = requireAuth(request)
    if (typeof auth !== 'string') return auth
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'missing id' }, { status: 400 })
    const url = `${process.env.INFLUXDB_URL}/api/v2/delete?org=${process.env.INFLUXDB_ORG}&bucket=${process.env.INFLUXDB_BUCKET}`
    const token = process.env.INFLUXDB_TOKEN
    if (!token) return NextResponse.json({ error: 'missing influx token' }, { status: 500 })

    const body = {
        start: '1970-01-01T00:00:00Z',
        stop: new Date().toISOString(),
        predicate: `_measurement="gst_info" AND id="${id}" AND owner="${auth}"`
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
