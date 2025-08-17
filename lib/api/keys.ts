import {
    ApiResponse,
    ApiError,
    ApiKey,
    CreateApiKeyInput,
    UpdateApiKeyInput,
    SetDefaultActionInput
} from '@/lib/types/api-keys'

// Base API configuration
const API_BASE_URL = '/api'

// Custom error class for API errors
export class ApiRequestError extends Error {
    constructor(
        public status: number,
        public statusText: string,
        public body?: any
    ) {
        super(`API Error ${status}: ${statusText}`)
        this.name = 'ApiRequestError'
    }
}

// Generic fetch wrapper with error handling
async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`

    const defaultHeaders = {
        'Content-Type': 'application/json',
        ...options.headers,
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers: defaultHeaders,
        })

        // Handle non-JSON responses or empty responses
        let data: any
        const contentType = response.headers.get('content-type')

        if (contentType && contentType.includes('application/json')) {
            data = await response.json()
        } else {
            data = await response.text()
        }

        if (!response.ok) {
            throw new ApiRequestError(response.status, response.statusText, data)
        }

        return data
    } catch (error) {
        if (error instanceof ApiRequestError) {
            throw error
        }

        // Network errors or other fetch errors
        throw new ApiRequestError(
            0,
            'Network Error',
            { message: error instanceof Error ? error.message : 'Unknown error' }
        )
    }
}

// API Keys service functions
export const apiKeysService = {
    // Get all keys for the current user
    getAll: async (): Promise<ApiResponse<ApiKey[]>> => {
        return apiRequest('/keys')
    },

    // Get a specific key by ID
    getById: async (id: string): Promise<ApiResponse<ApiKey>> => {
        return apiRequest(`/keys/${id}`)
    },

    // Create a new API key
    create: async (data: CreateApiKeyInput): Promise<ApiResponse<ApiKey>> => {
        return apiRequest('/keys', {
            method: 'POST',
            body: JSON.stringify(data),
        })
    },

    // Update an existing API key
    update: async (id: string, data: UpdateApiKeyInput): Promise<ApiResponse<ApiKey>> => {
        return apiRequest(`/keys/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        })
    },

    // Delete an API key
    delete: async (id: string): Promise<ApiResponse<{ message: string }>> => {
        return apiRequest(`/keys/${id}`, {
            method: 'DELETE',
        })
    },

    // Set an API key as default
    setDefault: async (id: string): Promise<ApiResponse<{ message: string }>> => {
        return apiRequest(`/keys/${id}`, {
            method: 'POST',
            body: JSON.stringify({ action: 'set-default' } as SetDefaultActionInput),
        })
    },
}
