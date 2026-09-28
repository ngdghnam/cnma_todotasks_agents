import cds, { DELETE, INSERT, SELECT, UPDATE } from '@sap/cds';

/**
 * BaseRepository - Abstract base class for all repositories.
 * SRP: Only handles data access via CQN, no business logic.
 * DIP: Domain layer depends on this abstraction, not concrete DB.
 */
export abstract class BaseRepository<T extends { ID?: string }> {
    constructor(protected readonly entityName: string) {}

    /**
     * Find entities by conditions.
     */
    async find(params: Partial<T> = {}): Promise<T[]> {
        let query = SELECT.from(this.entityName);
        if (Object.keys(params).length > 0) {
            query = query.where(params);
        }
        return cds.run(query) as Promise<T[]>;
    }

    /**
     * Find single entity by ID.
     */
    async findById(id: string): Promise<T | null> {
        const results = await cds.run(
            SELECT.from(this.entityName).where({ ID: id })
        ) as T[];
        return results[0] ?? null;
    }

    /**
     * Create single entity.
     */
    async create(data: Partial<T>): Promise<T> {
        return cds.run(INSERT.into(this.entityName).entries(data)) as Promise<T>;
    }

    /**
     * Create multiple entities (batch).
     */
    async createBatch(data: Partial<T>[]): Promise<T[]> {
        return cds.run(INSERT.into(this.entityName).entries(data)) as Promise<T[]>;
    }

    /**
     * Update entity by ID.
     */
    async update(id: string, data: Partial<T>): Promise<number> {
        return cds.run(
            UPDATE.entity(this.entityName).set(data).where({ ID: id })
        ) as Promise<number>;
    }

    /**
     * Delete entity by ID.
     */
    async delete(id: string): Promise<void> {
        await cds.run(DELETE.from(this.entityName).where({ ID: id }));
    }

    /**
     * Execute custom CQN query.
     */
    async runQuery<R>(query: unknown): Promise<R> {
        return cds.run(query as any) as Promise<R>;
    }
}