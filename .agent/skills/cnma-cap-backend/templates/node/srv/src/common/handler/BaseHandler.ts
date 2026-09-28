import { ApplicationService } from '@sap/cds';

/**
 * BaseHandler - Abstract handler with common utilities.
 * SRP: Handler only registers events, logic goes to events/.
 */
export abstract class BaseHandler {
    constructor(protected readonly srv: ApplicationService) {}

    abstract register(): void;

    protected getUser(req: any): string {
        return req.user?.id || 'anonymous';
    }

    protected getUserId(req: any): string {
        return this.getUser(req);
    }

    protected getTenant(req: any): string {
        return req.tenant || 'default';
    }

    protected getTenantId(req: any): string {
        return this.getTenant(req);
    }
}
