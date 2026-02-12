import { describe, it, expect } from 'vitest';
import { PIISanitizer } from './PIISanitizer';

describe('PIISanitizer', () => {
    const sanitizer = new PIISanitizer();

    describe('sanitizeText', () => {
        it('should redact credit card numbers', () => {
            expect(sanitizer.sanitizeText('Card: 4111-1111-1111-1111'))
                .toBe('Card: [REDACTED]');
        });

        it('should redact credit cards without dashes', () => {
            expect(sanitizer.sanitizeText('Card: 4111111111111111'))
                .toBe('Card: [REDACTED]');
        });

        it('should redact SSN patterns', () => {
            expect(sanitizer.sanitizeText('SSN: 123-45-6789'))
                .toBe('SSN: [REDACTED]');
        });

        it('should redact email addresses', () => {
            expect(sanitizer.sanitizeText('Email: user@example.com'))
                .toBe('Email: [REDACTED]');
        });

        it('should leave normal text untouched', () => {
            expect(sanitizer.sanitizeText('Welcome to our pricing page'))
                .toBe('Welcome to our pricing page');
        });
    });
});
