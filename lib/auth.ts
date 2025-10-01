import { NextResponse } from 'next/server'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'

const DATA_DIR = path.resolve(process.cwd(), 'data')
const USERS_FILE = path.join(DATA_DIR, 'users.json')
const SECRET = process.env.AUTH_SECRET || 'dev-secret'

type StoredUser = {
    username: string
    hash: string
    salt: string
    iterations: number
    profile?: { name?: string; email?: string; contact?: string }
}

function ensureStore() {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR)
    if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, JSON.stringify([]))
}

function loadUsers(): StoredUser[] {
    ensureStore()
    try {
        const raw = fs.readFileSync(USERS_FILE, 'utf8')
        return JSON.parse(raw || '[]') as StoredUser[]
    } catch {
        return []
    }
}

function saveUsers(users: StoredUser[]) {
    ensureStore()
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2))
}

function hashPassword(password: string, salt?: string, iterations = 310000) {
    const useSalt = salt ?? crypto.randomBytes(16).toString('hex')
    const hash = crypto.pbkdf2Sync(password, useSalt, iterations, 64, 'sha512').toString('hex')
    return { hash, salt: useSalt, iterations }
}

export function addUser(username: string, password: string) {
    const users = loadUsers()
    if (users.find((u) => u.username === username)) throw new Error('user exists')
    const { hash, salt, iterations } = hashPassword(password)
    users.push({ username, hash, salt, iterations, profile: {} })
    saveUsers(users)
    return true
}

export function verifyUser(username: string, password: string) {
    const users = loadUsers()
    const u = users.find((x) => x.username === username)
    if (!u) return false
    const h = crypto.pbkdf2Sync(password, u.salt, u.iterations, 64, 'sha512').toString('hex')
    return h === u.hash
}

export function setPassword(username: string, newPassword: string) {
    const users = loadUsers()
    const idx = users.findIndex((x) => x.username === username)
    if (idx === -1) throw new Error('not found')
    const { hash, salt, iterations } = hashPassword(newPassword)
    users[idx].hash = hash
    users[idx].salt = salt
    users[idx].iterations = iterations
    saveUsers(users)
}

export function getProfile(username: string) {
    const users = loadUsers()
    const u = users.find((x) => x.username === username)
    return u?.profile ?? {}
}

export function setProfile(username: string, profile: { name?: string; email?: string; contact?: string }) {
    const users = loadUsers()
    const idx = users.findIndex((x) => x.username === username)
    if (idx === -1) throw new Error('not found')
    users[idx].profile = { ...(users[idx].profile || {}), ...(profile || {}) }
    saveUsers(users)
}

// Token: payload.base64 + '.' + hmac
export function issueToken(username: string, expiresInSec = 60 * 60 * 24 * 7) {
    const payload = { username, exp: Math.floor(Date.now() / 1000) + expiresInSec }
    const data = Buffer.from(JSON.stringify(payload)).toString('base64url')
    const sig = crypto.createHmac('sha256', SECRET).update(data).digest('base64url')
    return `${data}.${sig}`
}

export function verifyToken(token: string) {
    try {
        const [data, sig] = token.split('.')
        const expected = crypto.createHmac('sha256', SECRET).update(data).digest('base64url')
        if (!sig || sig !== expected) return null
        const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8')) as { username: string; exp: number }
        if (payload.exp < Math.floor(Date.now() / 1000)) return null
        return payload.username
    } catch {
        return null
    }
}

export function requireAuth(request: Request) {
    const cookie = request.headers.get('cookie') || ''
    const match = cookie.split(';').map((c) => c.trim()).find((c) => c.startsWith('session='))
    if (!match) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    const token = match.split('=')[1]
    const username = verifyToken(token)
    if (!username) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    return username
}

export function hasUsers() {
    const users = loadUsers()
    return users.length > 0
}
