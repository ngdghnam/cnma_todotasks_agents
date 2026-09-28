// @ts-nocheck
import { describe, test, expect, afterEach, jest } from '@jest/globals';
import { sampleEntityService } from './SampleEntityService';

// Mock @cnma/cap-core/text to return a mock i18n bundle directly
jest.mock('@cnma/cap-core/text', () => {
    return {
        getText: jest.fn().mockReturnValue({
            getMessage: jest.fn().mockImplementation((key: any) => {
                if (key === 'SAMPLE_ENTITY_EMPTY_PAYLOAD') {
                    return 'Invalid data: empty payload';
                }
                return key;
            }),
            getLocale: jest.fn().mockReturnValue('en')
        })
    };
});

describe('SampleEntityService with cap-core getText', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should fail validation with correct localized message when payload is empty', async () => {
        const response = await sampleEntityService.validateCreate({});
        expect(response.valid).toBe(false);
        expect(response.message).toBe('Invalid data: empty payload');
    });

    test('should succeed validation when payload is populated', async () => {
        const response = await sampleEntityService.validateCreate({ ID: 'test-id' });
        expect(response.valid).toBe(true);
        expect(response.message).toBe('Valid');
    });
});
