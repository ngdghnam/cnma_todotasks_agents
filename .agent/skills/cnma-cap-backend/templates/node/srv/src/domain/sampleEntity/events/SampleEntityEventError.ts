// @ts-nocheck
import { ServiceException, ValidationException } from '../../../common/exception/ServiceException';

export function rejectSampleEntityEvent(req: any, context: string, error: unknown): void {
    const statusCode = error instanceof ValidationException ? 400 : 500;
    const message = error instanceof ServiceException || error instanceof Error
        ? error.message
        : String(error);

    req.error(statusCode, `${context}: ${message}`);
}
