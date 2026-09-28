/**
 * BaseService - Abstract base class for all services.
 * Provides: i18n text retrieval, response builders, managed field setters.
 *
 * EXTEND THIS CLASS for any new service that needs:
 * - Localized messages (getText)
 * - Standardized response formatting (buildServiceResponse, buildApiResponse)
 * - Audit fields (setCreateManaged, setUpdateManaged)
 *
 * DIP: Services depend on Repository abstraction via constructor injection.
 */
import { ICommonService, IServiceResponse, IValidationResponseData, IApiResponse } from '../interfaces/ICommon';
import { HTTP_SUCCESS_CODES } from '../enum/HttpStatusCodeEnum';

export abstract class BaseService {
    /**
     * Build service response with status code.
     */
    buildServiceResponse<T>(statusCode: number, message: string, data?: T): IServiceResponse<T> {
        const success = HTTP_SUCCESS_CODES.includes(statusCode);
        return {
            statusCode,
            success,
            message,
            data: data || null,
            toApiResponse(): IApiResponse<T> {
                return { success: this.success, message: this.message, data: this.data };
            }
        };
    }

    /**
     * Build validation response.
     */
    buildValidationResponse<T>(valid: boolean, message: string): IValidationResponseData<T> {
        return {
            valid,
            message,
            toApiResponse(): IApiResponse<T> {
                return { success: this.valid, message: this.message, data: null };
            }
        };
    }

    /**
     * Set create managed fields (audit trail).
     */
    setCreateManaged(data: any, owner: string): void {
        data.createdAt = new Date().toISOString();
        data.createdBy = owner;
        data.modifiedAt = new Date().toISOString();
        data.modifiedBy = owner;
    }

    /**
     * Set update managed fields.
     */
    setUpdateManaged(data: any, owner: string): void {
        data.modifiedAt = new Date().toISOString();
        data.modifiedBy = owner;
    }
}