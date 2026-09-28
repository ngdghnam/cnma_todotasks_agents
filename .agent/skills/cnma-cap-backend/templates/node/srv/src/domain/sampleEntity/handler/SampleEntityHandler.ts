// @ts-nocheck
import cds from '@sap/cds';
import { ApplicationService } from '@sap/cds';
import { SampleEntity } from '#cds-models/cnma/init';
import { createDebugLogger } from '../../../common/util/DebugLogger';
import { OnReadSampleEntityEvent } from '../events/OnReadSampleEntityEvent';
import { OnBeforeCreateSampleEntityEvent } from '../events/OnBeforeCreateSampleEntityEvent';
import { OnAfterCreateSampleEntityEvent } from '../events/OnAfterCreateSampleEntityEvent';
import { OnBeforeUpdateSampleEntityEvent } from '../events/OnBeforeUpdateSampleEntityEvent';
import { OnAfterUpdateSampleEntityEvent } from '../events/OnAfterUpdateSampleEntityEvent';
import { OnAfterDeleteSampleEntityEvent } from '../events/OnAfterDeleteSampleEntityEvent';

const Logger = createDebugLogger('SampleEntityHandler');

class SampleEntityHandler extends ApplicationService {
    // Use CDS model name instead of hardcoded string
    private readonly entityName = SampleEntity.name;

    register(): void {
        Logger.debug('Registering SampleEntity event handlers');

        this.on('READ', this.entityName, async (req) => {
            Logger.debug('READ event triggered on SampleEntity');
            return OnReadSampleEntityEvent.execute(req);
        });

        this.before('CREATE', this.entityName, async (req) => {
            Logger.debug('before CREATE event triggered on SampleEntity');
            await OnBeforeCreateSampleEntityEvent.execute(req);
        });

        this.after('CREATE', this.entityName, async (res, req) => {
            Logger.debug('after CREATE event triggered on SampleEntity');
            await OnAfterCreateSampleEntityEvent.execute(res, req);
        });

        this.before('UPDATE', this.entityName, async (req) => {
            Logger.debug('before UPDATE event triggered on SampleEntity');
            await OnBeforeUpdateSampleEntityEvent.execute(req);
        });

        this.after('UPDATE', this.entityName, async (res, req) => {
            Logger.debug('after UPDATE event triggered on SampleEntity');
            await OnAfterUpdateSampleEntityEvent.execute(res, req);
        });

        this.after('DELETE', this.entityName, async (res, req) => {
            Logger.debug('after DELETE event triggered on SampleEntity');
            await OnAfterDeleteSampleEntityEvent.execute(res, req);
        });
    }
}

export = (srv: cds.ApplicationService) => {
    new SampleEntityHandler(srv).register();
};