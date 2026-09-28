// @ts-nocheck
import { BaseRepository } from '../../../common/repository/BaseRepository';
import { SampleEntity } from '#cds-models/cnma/init';

export class SampleEntityRepository extends BaseRepository<typeof SampleEntity> {
    constructor() {
        // Use CDS model entity name instead of hardcoded string
        super(SampleEntity.name);
    }
}