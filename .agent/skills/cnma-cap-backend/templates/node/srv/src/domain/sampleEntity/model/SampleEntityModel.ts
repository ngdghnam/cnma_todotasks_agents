// @ts-nocheck
import { SampleEntity } from '#cds-models/cnma/init';

/**
 * SampleEntityModel - Entity model interface.
 * Extends from CDS generated SampleEntity type.
 * Use this type for type-safe entity operations.
 */
export interface SampleEntityModel extends SampleEntity {}

/**
 * SampleEntityCreateInput - Input type for create operations.
 */
export interface SampleEntityCreateInput {
    name?: string;
    description?: string;
    status?: string;
}

/**
 * SampleEntityUpdateInput - Input type for update operations.
 */
export interface SampleEntityUpdateInput {
    name?: string;
    description?: string;
    status?: string;
}