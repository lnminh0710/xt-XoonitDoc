import { Directive, ElementRef, Input } from '@angular/core';

@Directive({
    selector: '[xnAppendStyle]'
})
export class XnAppendStyleDirective {

    constructor(private element: ElementRef) {

    }

    @Input()
    set xnAppendStyle(data: any) {
        if (!data || !this.element.nativeElement) return;

        $(this.element.nativeElement).find('input').css(data);
    }
}
