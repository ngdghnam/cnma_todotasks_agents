/**
 * CDS Event Types for TypeScript strict mode support.
 * Provides proper typing for CAP event handlers.
 */
import type cds from '@sap/cds';

/**
 * Base interface for all CDS event request objects.
 */
export interface ICdsRequest {
    readonly data: any;
    readonly user: cds.User | undefined;
    readonly tenant: string | undefined;
    readonly locale: string | undefined;
    readonly path: string;
    readonly method: string;
    readonly query: cds.Select | cds.Insert | cds.Update | cds.Delete;
}

/**
 * CDS READ event handler signature.
 */
export type CdsReadHandler<T = any> = (req: cds.Request) => Promise<T> | T;

/**
 * CDS CREATE event handler signatures.
 */
export type CdsBeforeCreateHandler = (req: cds.Request) => Promise<void> | void;
export type CdsAfterCreateHandler = (result: any, req: cds.Request) => Promise<void> | void;

/**
 * CDS UPDATE event handler signatures.
 */
export type CdsBeforeUpdateHandler = (req: cds.Request) => Promise<void> | void;
export type CdsAfterUpdateHandler = (result: any, req: cds.Request) => Promise<void> | void;

/**
 * CDS DELETE event handler signatures.
 */
export type CdsAfterDeleteHandler = (result: any, req: cds.Request) => Promise<void> | void;

/**
 * CDS event handler interface for a feature.
 */
export interface ICdsEventHandlers {
    onRead?: CdsReadHandler;
    onBeforeCreate?: CdsBeforeCreateHandler;
    onAfterCreate?: CdsAfterCreateHandler;
    onBeforeUpdate?: CdsBeforeUpdateHandler;
    onAfterUpdate?: CdsAfterUpdateHandler;
    onAfterDelete?: CdsAfterDeleteHandler;
}

/**
 * Entity model interface for feature domain.
 */
export interface IFeatureEntity {
    ID?: string;
    createdAt?: string;
    createdBy?: string;
    modifiedAt?: string;
    modifiedBy?: string;
}

/**
 * Validation result returned from service methods.
 */
export interface IValidationResult {
    valid: boolean;
    message: string;
    errors?: Record<string, string>;
}

/**
 * Event execution context.
 */
export interface IEventContext {
    req: cds.Request;
    service: any;
    repository: any;
}