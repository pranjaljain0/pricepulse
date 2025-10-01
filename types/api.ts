// Central types for API handlers

export interface ApiError {
    message?: string
    status?: number
    code?: string
    [key: string]: unknown
}
