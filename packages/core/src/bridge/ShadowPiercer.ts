/**
 * ShadowPiercer — Shadow DOM & Iframe Traversal Module
 * 
 * Standard querySelector cannot see inside Shadow DOM or Iframes.
 * This module provides recursive traversal to find elements hidden
 * behind web component boundaries.
 */

export interface PiercedElement {
    element: Element;
    path: string[];          // e.g. ['#host', 'shadow-root', '.inner-btn']
    isShadow: boolean;
    isIframe: boolean;
}

export class ShadowPiercer {

    /**
     * Deep query: searches the main DOM, then recursively into
     * open Shadow DOMs and same-origin iframes.
     */
    deepQuery(selector: string, root?: Document | ShadowRoot): PiercedElement | null {
        const rootNode = root || (typeof document !== 'undefined' ? document : null);
        if (!rootNode) return null;

        // 1. Try standard query first (fast path)
        const direct = rootNode.querySelector(selector);
        if (direct) {
            return { element: direct, path: [selector], isShadow: false, isIframe: false };
        }

        // 2. Recurse into Shadow DOMs
        const allElements = rootNode.querySelectorAll('*');
        for (const el of allElements) {
            if (el.shadowRoot) {
                const found = this.deepQuery(selector, el.shadowRoot);
                if (found) {
                    return {
                        ...found,
                        path: [`${el.tagName.toLowerCase()}::shadow`, ...found.path],
                        isShadow: true,
                    };
                }
            }
        }

        // 3. Recurse into same-origin iframes
        if (typeof document !== 'undefined' && (rootNode === document || (rootNode as any).nodeType === 9)) {
            const iframes = (rootNode as Document).querySelectorAll('iframe');
            for (const iframe of iframes) {
                try {
                    const iframeDoc = iframe.contentDocument;
                    if (iframeDoc) {
                        const found = this.deepQuery(selector, iframeDoc);
                        if (found) {
                            return {
                                ...found,
                                path: [`iframe[src="${iframe.src}"]`, ...found.path],
                                isIframe: true,
                            };
                        }
                    }
                } catch {
                    // Cross-origin iframe — skip silently
                    continue;
                }
            }
        }

        return null;
    }

    /**
     * Deep queryAll: returns ALL matching elements across boundaries.
     */
    deepQueryAll(selector: string, root?: Document | ShadowRoot): PiercedElement[] {
        const rootNode = root || (typeof document !== 'undefined' ? document : null);
        if (!rootNode) return [];
        const results: PiercedElement[] = [];

        // Standard matches
        const directMatches = rootNode.querySelectorAll(selector);
        for (const el of directMatches) {
            results.push({ element: el, path: [selector], isShadow: false, isIframe: false });
        }

        // Shadow DOM recursion
        const allElements = rootNode.querySelectorAll('*');
        for (const el of allElements) {
            if (el.shadowRoot) {
                const shadowResults = this.deepQueryAll(selector, el.shadowRoot);
                for (const sr of shadowResults) {
                    results.push({
                        ...sr,
                        path: [`${el.tagName.toLowerCase()}::shadow`, ...sr.path],
                        isShadow: true,
                    });
                }
            }
        }

        return results;
    }

    /**
     * Get the bounding rect of a pierced element, accounting for
     * iframe offset if necessary.
     */
    getPiercedRect(pierced: PiercedElement): DOMRect {
        const rect = pierced.element.getBoundingClientRect();

        if (!pierced.isIframe) return rect;

        // For iframe elements, we need to offset by the iframe's position
        let currentEl: Element | null = pierced.element;
        let offsetX = 0;
        let offsetY = 0;

        // Walk up to find the iframe container
        while (currentEl) {
            const ownerDoc = currentEl.ownerDocument;
            if (typeof document !== 'undefined' && ownerDoc !== document) {
                const frameEl = ownerDoc.defaultView?.frameElement;
                if (frameEl) {
                    const frameRect = frameEl.getBoundingClientRect();
                    offsetX += frameRect.left;
                    offsetY += frameRect.top;
                }
            }
            currentEl = null;
        }

        return new DOMRect(rect.x + offsetX, rect.y + offsetY, rect.width, rect.height);
    }
}
