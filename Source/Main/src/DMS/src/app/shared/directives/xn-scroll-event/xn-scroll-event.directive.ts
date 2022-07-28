import { Directive, HostListener, Output, EventEmitter, Input } from '@angular/core';

export type ScrollEvent = {
    originalEvent: Event,
    isReachingBottom: boolean
};

@Directive({
    selector: '[xn-detect-scroll]'
})

export class DetectScrollDirective {

    @Output()
    public onScroll = new EventEmitter<ScrollEvent>();

    @Input()
    public bottomOffset: number = 100;

    constructor() { }

    /**
     * Scroll 
     * @param $event
     */
    @HostListener('scroll', ['$event'])
    public scrolled($event: Event) {
        this.elementScrollEvent($event);
    }

    /**
     * elementScrollEvent
     * @param $event
     */
    private elementScrollEvent($event: Event) {
        const target = <HTMLElement>$event.target;
        if (target.scrollHeight > target.offsetHeight) {
            const scrollPosition = target.scrollHeight - target.scrollTop;
            const offsetHeight = target.offsetHeight;
            const isReachingBottom = (scrollPosition - offsetHeight) < this.bottomOffset;
            const emitValue: ScrollEvent = { isReachingBottom, originalEvent: $event };
            this.onScroll.emit(emitValue);
        }
    }
}

