// InfluxDB v2 helper
// Provides a typed client, queryApi and writeApi for server-side usage.
import { FluxTableMetaData, InfluxDB, Point } from '@influxdata/influxdb-client'

const url = process.env.INFLUXDB_URL
const token = process.env.INFLUXDB_TOKEN
const org = process.env.INFLUXDB_ORG
const bucket = process.env.INFLUXDB_BUCKET

if (!url || !token || !org || !bucket) {
    // In Next.js server runtime this will throw during initialization if env is missing.
    // Keep this check so errors surface early in development.
    throw new Error('Missing one or more InfluxDB environment variables: INFLUXDB_URL, INFLUXDB_TOKEN, INFLUXDB_ORG, INFLUXDB_BUCKET')
}

export const influx = new InfluxDB({ url, token })

export const getQueryApi = () => influx.getQueryApi(org)
export const getWriteApi = () => influx.getWriteApi(org, bucket)

// Small helper to write a single measurement point
export async function writePoint(measurement: string, tags: Record<string, string> = {}, fields: Record<string, number | string | boolean> = {}) {
    const writeApi = getWriteApi()
    const point = new Point(measurement)
    Object.entries(tags).forEach(([k, v]) => point.tag(k, v))
    Object.entries(fields).forEach(([k, v]) => {
        if (typeof v === 'number') point.floatField(k, v)
        else if (typeof v === 'boolean') point.booleanField(k, v)
        else point.stringField(k, String(v))
    })
    writeApi.writePoint(point)
    try {
        await writeApi.close()
    } catch (err) {
        // rethrow for visibility
        throw err
    }
}

// Small helper to run a Flux query and collect rows into an array of objects
export async function queryFlux<T = Record<string, unknown>>(flux: string): Promise<T[]> {
    const queryApi = getQueryApi()
    const rows: T[] = []
    return new Promise((resolve, reject) => {
        queryApi.queryRows(flux, {
            next(row: string[], tableMeta: FluxTableMetaData) {
                const obj = tableMeta.toObject(row)
                rows.push(obj as T)
            },
            error(err: Error) {
                reject(err)
            },
            complete() {
                resolve(rows)
            }
        })
    })
}

// Usage examples (server-side):
// import { writePoint, queryFlux } from 'lib/influx'
// await writePoint('page_load', {host: 'web-1'}, {duration_ms: 123})
// const results = await queryFlux('from(bucket:"my-bucket") |> range(start: -1h) |> limit(n:5)')
