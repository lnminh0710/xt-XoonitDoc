import { OnDestroy, Directive, HostListener, ElementRef, Input } from '@angular/core';

@Directive({
    selector: '[xn-control-focus]',
})

export class XnControlFocusDirective implements OnDestroy {

    @Input() form: any;

    constructor(private eleRef: ElementRef) {
    }

    @HostListener('keydown.enter', ['$event']) onKeyDown(event) {
        // TODO
        // var a = this.eleRef;
        // var aa = this.form;
        // this.eleRef.nativeElement.nextElementSibling.focus();
    }

    ngOnDestroy(): void {
    }
}
