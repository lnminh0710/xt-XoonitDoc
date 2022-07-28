import { Directive, ElementRef } from '@angular/core';

@Directive({
    selector: '[xnFocusError]',
    exportAs:'xnFocusError' 
})
export class XnFocusErrorDirective {

    constructor(
        private elementRef: ElementRef
    ) {
    }
    
    public setFocusError(): void {
        try {
            // material
            const matErrorElement: Element = this.elementRef.nativeElement.querySelector(".ng-invalid[aria-invalid]");
            if (matErrorElement) {
                matErrorElement['focus']();
                return;
            }

            const dynamicControlElement: Element = this.elementRef.nativeElement.querySelector("mat-error");
            if (dynamicControlElement) {
                dynamicControlElement.scrollIntoView();
                return;
            }

            // grid
            const gridErrorElement: Element = this.elementRef.nativeElement.querySelector(".invalid-cell[role='gridcell']");
            if (gridErrorElement) {
                gridErrorElement['focus']();
                return;
            }
        } catch (err) {
        }
    }
}
