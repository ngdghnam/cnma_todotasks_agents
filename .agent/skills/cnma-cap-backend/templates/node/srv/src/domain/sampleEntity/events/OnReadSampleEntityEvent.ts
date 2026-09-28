// @ts-nocheck
import { sampleEntityService } from '../service/SampleEntityService';
import { rejectSampleEntityEvent } from './SampleEntityEventError';

export const OnReadSampleEntityEvent = {
    execute: async (req: any): Promise<any> => {
        try {
            // Use service for data access (DIP: events use service, not repository directly)
            return await sampleEntityService.find(req.query);
        } catch (error: any) {
            rejectSampleEntityEvent(req, 'Error reading SampleEntity', error);
        }
    }
};