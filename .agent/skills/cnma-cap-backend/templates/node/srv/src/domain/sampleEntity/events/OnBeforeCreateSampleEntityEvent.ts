// @ts-nocheck
import { sampleEntityService } from '../service/SampleEntityService';
import { rejectSampleEntityEvent } from './SampleEntityEventError';
import { ValidationException } from '../../../common/exception/ServiceException';
import cds from '@sap/cds';
import { SampleEntity } from '#cds-models/cnma/init';

export const OnBeforeCreateSampleEntityEvent = {
    execute: async (req: any): Promise<void> => {
        try {
            const data = req.data;
            const userId = req.user?.id || 'anonymous';

            const validation = await sampleEntityService.validateCreate(data);
            if (!validation.valid) {
                throw new ValidationException(validation.message);
            }

            // Use CDS model for entity name instead of hardcoded string
            if (!data.ID) {
                data.ID = cds.utils.uuid();
            }

            data.createdAt = new Date().toISOString();
            data.createdBy = userId;
            data.modifiedAt = new Date().toISOString();
            data.modifiedBy = userId;
        } catch (error: any) {
            rejectSampleEntityEvent(req, 'Error in before create', error);
        }
    }
};