import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
    selector: '[XnEnterForm]',
})
export class XnEnterFormDirective {

    constructor(
        private elementRef: ElementRef
    ) {
    }

    @HostListener('keydown', ['$event'])
    onKeydown(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            const elements: Element[] = Array.from(this.elementRef.nativeElement.querySelectorAll("[enter-break='true']"));
            const activatingElement: Element = document.activeElement;
            const index = elements?.findIndex(element => element === activatingElement);
            if (index > -1) {
                activatingElement['blur']?.();
                const nextIndex = index + 1;
                if (nextIndex < elements.length) {
                    const nextElement: Element = elements[nextIndex];
                    nextElement['focus']();
                    nextElement['setSelectionRange']?.(0, nextElement['value']?.length);
                }
            }
        }
    }
}
