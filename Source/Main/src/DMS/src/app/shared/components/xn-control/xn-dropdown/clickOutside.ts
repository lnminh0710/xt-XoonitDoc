import { Directive, ElementRef, Output, EventEmitter, HostListener, Input, OnInit, OnChanges, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';


@Directive({
    selector: '[scroll]'
})
export class ScrollDirective {
    constructor(private _elementRef: ElementRef) {
    }

    @Output()
    public scroll = new EventEmitter<MouseEvent>();

    @HostListener('scroll', ['$event'])
    public onClick(event: MouseEvent, targetElement: HTMLElement): void {
        this.scroll.emit(event);
    }
}
@Directive({
    selector: '[styleProp]'
})
export class styleDirective {

    constructor(private el: ElementRef) {

    }

    @Input('styleProp') styleVal: number;

    ngOnInit() {

        this.el.nativeElement.style.top = this.styleVal;
    }
    ngOnChanges(): void {
        this.el.nativeElement.style.top = this.styleVal;
    }
}


@Directive({
    selector: '[setPosition]'
})
export class setPosition implements OnInit, OnChanges {

    @Input('setPosition') height: number;

    constructor(public el: ElementRef) {

    }
    ngOnInit() {
        if (this.height) {
            this.el.nativeElement.style.bottom = parseInt(this.height + 15 + "") + 'px';
        }
    }
    ngOnChanges(): void {
        if (this.height) {
            this.el.nativeElement.style.bottom = parseInt(this.height + 15 + "") + 'px';
        }
    }
}

@Pipe({ name: 'safeHtml' })
export class SafeHtmlPipe implements PipeTransform {
    constructor(private sanitized: DomSanitizer) { }
    transform(value) {
        return this.sanitized.bypassSecurityTrustHtml(value);
    }
}


@Pipe({ name: 'removeHtml' })
export class RemoveHtmlPipe implements PipeTransform {
    constructor() { }
    transform(value) {
        // return ('' + value).replace(/<[^>]*>/g, '').trim();
        return ('' + value).replace(/(<([^>]+)>)/ig, '').replace(/&nbsp;/gi, ' ').trim();
    }
}
