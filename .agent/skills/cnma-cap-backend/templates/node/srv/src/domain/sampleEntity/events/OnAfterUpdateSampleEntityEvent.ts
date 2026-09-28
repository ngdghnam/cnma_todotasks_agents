// @ts-nocheck
import { rejectSampleEntityEvent } from './SampleEntityEventError';
import { createDebugLogger } from '../../../common/util/DebugLogger';

const Logger = createDebugLogger('SampleEntity');

export const OnAfterUpdateSampleEntityEvent = {
    execute: async (res: any, req: any): Promise<void> => {
        try {
            const userId = req.user?.id || 'anonymous';
            LOG.info(`[SampleEntity] Updated by ${userId}`, res);
        } catch (error: any) {
            rejectSampleEntityEvent(req, 'Error in after update', error);
        }
    }
};
