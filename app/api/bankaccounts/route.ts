import { queryFlux, writePoint } from '../../../lib/influx'

import { NextResponse } from 'next/server'

type BankAccount = {
    id: string
    account_number?: string
    bank?: string
    branch?: string
    ifsc?: string
    cif?: string
    other_details?: string
    _time?: string
}

export async function GET() {
    // Query raw rows and assemble latest point per id in JS. This avoids pivot errors when the
    // flux table does not include the expected `_value` column in some environments or datasets.
    const flux = `from(bucket: "${process.env.INFLUXDB_BUCKET}")
    |> range(start: -30d)
    |> filter(fn: (r) => r._measurement == "bank_account")
    |> sort(columns: ["_time"])`

    const raw = await queryFlux<Record<string, unknown>>(flux)

    // Group rows by id, then by _time so we can pick the latest snapshot per id
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

    const result: BankAccount[] = []
    grouped.forEach((byTime) => {
        // pick the latest time key
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
                result.push(latestObj as BankAccount)
            }
        }
    })

    return NextResponse.json(result)
}

export async function POST(request: Request) {
    const body = await request.json()
    // server-side validation
    if (!body.account_number || !body.bank || !body.account_holder) {
        return NextResponse.json({ error: 'account_number, account_holder and bank are required' }, { status: 400 })
    }
    if (body.ifsc && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(body.ifsc)) {
        return NextResponse.json({ error: 'invalid ifsc' }, { status: 400 })
    }
    const id = body.id ? String(body.id) : String(Date.now())
    // Write point with fields (if body.id is provided we'll use it so edits keep the same id)
    await writePoint('bank_account', { id }, {
        account_number: body.account_number || '',
        account_holder: body.account_holder || '',
        bank: body.bank || '',
        branch: body.branch || '',
        ifsc: body.ifsc || '',
        cif: body.cif || '',
        other_details: body.other_details || '',
        deleted: false
    })
    return NextResponse.json({ id })
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'missing id' }, { status: 400 })

    // Hard delete via InfluxDB delete API. Requires INFLUXDB_TOKEN with delete permission.
    const url = `${process.env.INFLUXDB_URL}/api/v2/delete?org=${process.env.INFLUXDB_ORG}&bucket=${process.env.INFLUXDB_BUCKET}`
    const token = process.env.INFLUXDB_TOKEN
    if (!token) return NextResponse.json({ error: 'missing influx token' }, { status: 500 })

    const body = {
        start: '1970-01-01T00:00:00Z',
        stop: new Date().toISOString(),
        predicate: `_measurement="bank_account" AND id="${id}"`
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
