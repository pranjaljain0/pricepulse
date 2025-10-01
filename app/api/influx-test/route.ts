import { queryFlux, writePoint } from '../../../lib/influx'

import type { ApiError } from '../../../types/api'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        // write a test point
        await writePoint('pricepulse_test', { host: 'dev' }, { value: Math.random() * 100 })

        // query last 5 points for the measurement we just wrote
        const flux = `from(bucket: "${process.env.INFLUXDB_BUCKET}") |> range(start: -1h) |> filter(fn: (r) => r._measurement == "pricepulse_test") |> limit(n:5)`
        const rows = await queryFlux(flux)

        return NextResponse.json({ ok: true, rows })
    } catch (err) {
        const apiErr = err as ApiError
        return NextResponse.json({ ok: false, message: String(apiErr?.message ?? apiErr) }, { status: 500 })
    }
}
