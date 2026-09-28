// @ts-nocheck
import { BaseService } from '../../../common/service/BaseService';
import { createDebugLogger } from '../../../common/util/DebugLogger';
import { SampleEntityRepository } from '../repository/SampleEntityRepository';
import { SampleEntityModel, SampleEntityCreateInput, SampleEntityUpdateInput } from '../model/SampleEntityModel';
import { getText } from '@cnma/cap-core/text';

const Logger = createDebugLogger('SampleEntity');

export class SampleEntityService extends BaseService {
    private readonly repository: SampleEntityRepository;

    constructor(repository?: SampleEntityRepository) {
        super();
        this.repository = repository || new SampleEntityRepository();
    }

    /**
     * Find entities by query (used by OnRead event).
     * DIP: Service uses Repository, not direct DB access.
     */
    async find(query: any): Promise<SampleEntityModel[]> {
        Logger.debug('Finding SampleEntity with query');
        return this.repository.runQuery(query);
    }

    /**
     * Find entity by ID.
     */
    async findById(id: string): Promise<SampleEntityModel | null> {
        Logger.debug('Finding SampleEntity by ID:', id);
        return this.repository.findById(id);
    }

    /**
     * Validate create input.
     */
    async validateCreate(data: SampleEntityCreateInput): Promise<{ valid: boolean; message: string }> {
        Logger.debug('Validating SampleEntity create data:', data);
        if (!data || Object.keys(data).length === 0) {
            return this.buildValidationResponse(false, getText().getMessage('SAMPLE_ENTITY_EMPTY_PAYLOAD'));
        }
        return this.buildValidationResponse(true, 'Valid');
    }

    /**
     * Validate update input.
     */
    async validateUpdate(data: SampleEntityUpdateInput): Promise<{ valid: boolean; message: string }> {
        Logger.debug('Validating SampleEntity update data:', data);
        if (!data || Object.keys(data).length === 0) {
            return this.buildValidationResponse(false, getText().getMessage('SAMPLE_ENTITY_EMPTY_PAYLOAD'));
        }
        return this.buildValidationResponse(true, 'Valid');
    }

    /**
     * Check if entity exists by ID.
     */
    async exists(id: string): Promise<boolean> {
        const record = await this.repository.findById(id);
        return record !== null;
    }
}

export const sampleEntityService = new SampleEntityService();