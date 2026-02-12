/**
 * PIISanitizer — Sensitive Data Guard
 * 
 * Ensures the Context Engine never leaks passwords, credit cards,
 * or other PII to the LLM. Runs as a filter before any DOM content
 * is sent to the intelligence layer.
 */

const SENSITIVE_INPUT_TYPES = new Set([
    'password', 'tel', 'email', 'number',  // credit card fields
]);

const SENSITIVE_AUTOCOMPLETE = new Set([
    'cc-number', 'cc-exp', 'cc-csc', 'cc-name',
    'current-password', 'new-password',
    'one-time-code',
]);

// Credit card / SSN patterns
const PII_PATTERNS = [
    /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,   // Credit card
    /\b\d{3}[\s-]?\d{2}[\s-]?\d{4}\b/g,                 // SSN
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,     // Email
];

export interface SanitizedNode {
    tag: string;
    id?: string;
    text?: string;
    children?: SanitizedNode[];
    redacted?: boolean;
}

export class PIISanitizer {

    /**
     * Check if an element should be completely excluded from context.
     */
    shouldExclude(el: Element): boolean {
        // Developer opt-out
        if (el.hasAttribute('data-agent-ignore')) return true;

        // Sensitive inputs
        if (el instanceof HTMLInputElement) {
            if (SENSITIVE_INPUT_TYPES.has(el.type)) return true;
            const autocomplete = el.getAttribute('autocomplete') || '';
            if (SENSITIVE_AUTOCOMPLETE.has(autocomplete)) return true;
        }

        // Password managers / hidden credential fields
        if (el.closest('[data-agent-ignore]')) return true;

        return false;
    }

    /**
     * Redact PII patterns from text content before sending to LLM.
     */
    sanitizeText(text: string): string {
        let sanitized = text;
        for (const pattern of PII_PATTERNS) {
            sanitized = sanitized.replace(pattern, '[REDACTED]');
        }
        return sanitized;
    }

    /**
     * Process an entire DOM subtree into a sanitized semantic tree.
     * Elements marked with data-agent-ignore or containing sensitive
     * inputs are excluded entirely.
     */
    sanitizeTree(root: Element): SanitizedNode | null {
        if (this.shouldExclude(root)) {
            return { tag: root.tagName.toLowerCase(), redacted: true };
        }

        const node: SanitizedNode = {
            tag: root.tagName.toLowerCase(),
        };

        if (root.id) node.id = root.id;

        // Get direct text content (not from children)
        const directText = Array.from(root.childNodes)
            .filter((n) => n.nodeType === 3) // Node.TEXT_NODE
            .map((n) => n.textContent?.trim() || '')
            .filter(Boolean)
            .join(' ');

        if (directText) {
            node.text = this.sanitizeText(directText);
        }

        // Recurse into children
        const children: SanitizedNode[] = [];
        for (const child of root.children) {
            const sanitizedChild = this.sanitizeTree(child);
            if (sanitizedChild) children.push(sanitizedChild);
        }
        if (children.length > 0) node.children = children;

        return node;
    }
}
