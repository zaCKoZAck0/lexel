// Centralized application error with HTTP status support
export class AppError extends Error {
    status: number;
    constructor(message: string, status = 400) {
        super(message);
        this.status = status;
        this.name = 'AppError';
    }
}

export function isAppError(err: unknown): err is AppError {
    return err instanceof AppError;
}
