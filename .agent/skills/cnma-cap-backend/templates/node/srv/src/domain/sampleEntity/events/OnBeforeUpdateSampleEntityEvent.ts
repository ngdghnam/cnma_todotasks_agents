// @ts-nocheck
import { sampleEntityService } from '../service/SampleEntityService';
import { rejectSampleEntityEvent } from './SampleEntityEventError';
import { ValidationException } from '../../../common/exception/ServiceException';

export const OnBeforeUpdateSampleEntityEvent = {
    execute: async (req: any): Promise<void> => {
        try {
            const data = req.data;
            const userId = req.user?.id || 'anonymous';

            const validation = await sampleEntityService.validateUpdate(data);
            if (!validation.valid) {
                throw new ValidationException(validation.message);
            }

            data.modifiedAt = new Date().toISOString();
            data.modifiedBy = userId;
        } catch (error: any) {
            rejectSampleEntityEvent(req, 'Error in before update', error);
        }
    }
};
