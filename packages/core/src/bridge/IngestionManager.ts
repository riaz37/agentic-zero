import { z } from 'zod';
import { IngestionConfig } from '../types/bridge';

/**
 * IngestionManager — The "Pre-Flight" Data Orchestrator
 * 
 * Responsible for fetching, validating, and transforming external data
 * into a format the Agentic Framework can consume.
 */
export class IngestionManager {
    /**
     * Ingest data based on the provided configuration.
     * Supports fetching from URLs or processing direct JSON input.
     */
    async ingest(config: IngestionConfig): Promise<any> {
        let rawData: any;

        if (config.source.startsWith('http')) {
            const response = await fetch(config.source);
            if (!response.ok) {
                throw new Error(`Failed to fetch ingestion source: ${response.statusText}`);
            }
            rawData = await response.json();
        } else {
            try {
                rawData = JSON.parse(config.source);
            } catch {
                rawData = config.source; // Assume it's already an object or raw string
            }
        }

        // 1. Transform if needed
        let transformedData = config.transform ? config.transform(rawData) : rawData;

        // 2. Validate if schema provided
        if (config.schema) {
            const schema = config.schema instanceof z.ZodType
                ? config.schema
                : this.resolveSchema(config.schema);

            const result = schema.safeParse(transformedData);
            if (!result.success) {
                throw new Error(`Ingestion validation failed: ${result.error.message}`);
            }
            transformedData = result.data;
        }

        return transformedData;
    }

    /**
     * Map string identifiers to predefined Zod schemas.
     */
    private resolveSchema(schemaName: string): z.ZodType {
        const registry: Record<string, z.ZodType> = {
            'journey': z.object({
                steps: z.array(z.string()),
                metadata: z.record(z.string(), z.any()).optional(),
            }),
            'checkpoint': z.object({
                id: z.string(),
                narrative: z.string(),
            }),
        };

        const schema = registry[schemaName];
        if (!schema) {
            throw new Error(`Unknown ingestion schema: ${schemaName}`);
        }
        return schema;
    }
}
