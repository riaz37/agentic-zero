// This will run in a separate Web Worker to keep the main thread at 60FPS
export class ContextObserver {
    private observer: MutationObserver | null = null;
    private targetId: string | null = null;

    constructor(private onUpdate: (data: any) => void) { }

    public watch(selector: string) {
        this.targetId = selector;
        if (this.observer) this.observer.disconnect();

        const target = document.querySelector(selector);
        if (!target) {
            this.onUpdate({ type: 'ELEMENT_MISSING', selector });
            return;
        }

        this.observer = new MutationObserver(() => {
            const rect = target.getBoundingClientRect();
            this.onUpdate({
                type: 'ELEMENT_MOVED',
                rect,
                isVisible: this.isElementInViewport(target),
            });
        });

        this.observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
        });
    }

    private isElementInViewport(el: Element) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    public disconnect() {
        if (this.observer) this.observer.disconnect();
    }
}
