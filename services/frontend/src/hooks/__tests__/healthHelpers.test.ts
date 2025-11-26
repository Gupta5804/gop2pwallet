import { describe, it, expect } from 'vitest';
import { getStatusColor } from '../../utils/healthHelpers';

describe('getStatusColor', () => {
    it('returns green when online', () => {
        expect(getStatusColor('online', false)).toBe('green');
    });

    it('returns red when error occurs', () => {
        expect(getStatusColor(undefined, true)).toBe('red');
    });

    it('returns gray when loading or unknown', () => {
        expect(getStatusColor(undefined, false)).toBe('gray');
    });
});
