// @ts-nocheck
import { rejectSampleEntityEvent } from './SampleEntityEventError';
import { createDebugLogger } from '../../../common/util/DebugLogger';

const Logger = createDebugLogger('SampleEntity');

export const OnAfterDeleteSampleEntityEvent = {
    execute: async (res: any, req: any): Promise<void> => {
        try {
            LOG.info('[SampleEntity] Deleted', res);
        } catch (error: any) {
            rejectSampleEntityEvent(req, 'Error in after delete', error);
        }
    }
};
