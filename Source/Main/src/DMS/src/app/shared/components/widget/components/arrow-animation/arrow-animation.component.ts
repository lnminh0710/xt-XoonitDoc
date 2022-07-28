import {
    Component, Input, Output, EventEmitter,
    OnInit, OnDestroy, AfterViewInit,
    ElementRef, ChangeDetectorRef,
    NgZone, ViewChild
} from "@angular/core";
import { PerfectScrollbarDirective } from 'ngx-perfect-scrollbar';
import * as Ps from 'perfect-scrollbar';
import {
    DomHandler, ScrollUtils
} from '@app/services';

@Component({
    selector: 'arrow-animation',
    templateUrl: './arrow-animation.component.html',
    styleUrls: ['./arrow-animation.component.scss']
})
export class ArrowAnimationComponent implements OnInit, OnDestroy, AfterViewInit {
    private moveStepScrollPercentage = 0.2;
    @Input() blinkMode: boolean;
    @Input() mode: string;    
    @Input() scrollStatus: any;
    private _directiveScroll: PerfectScrollbarDirective;
    @Input() set directiveScroll(perfectScrollbarDirective: PerfectScrollbarDirective)
    {
        if (perfectScrollbarDirective) {
            this._directiveScroll = perfectScrollbarDirective;
        }
    }

    get directiveScroll() {
        return this._directiveScroll;
    }

    @Output() onScroll = new EventEmitter<any>();
    @Output() onScrollHover = new EventEmitter<any>();
    @Output() onScrollUnHover = new EventEmitter<any>();

    private _scrollUtils: ScrollUtils;
    private get scrollUtils() {
        if (!this._scrollUtils) {
            this._scrollUtils = new ScrollUtils(this.scrollBodyContainer, this.domHandler);
        }
        return this._scrollUtils;
    }

    private timer: any;
    private num = 1;
    private counter = 0;
    private isFirstLoad = true;

    @ViewChild('arrowElement') arrowElement: ElementRef;

    constructor(private _eref: ElementRef, protected domHandler: DomHandler, private zone: NgZone) {

    }    

    /**
     * showHideArrow
     */
    public showHideArrow() {
        if (this.isFirstLoad) {
            // this.isHidden = true;
            this.isFirstLoad = false;
            this.counter++;
            this.num = this.num * 2;
            this.domHandler.addClass(this.arrowElement.nativeElement, 'hidden');
            return;
        }
        if (this.counter == 0) {
            // this.isHidden = false;
            this.counter++;
            if (this.num < 8) {
                this.num = this.num * 2;
            }
            this.domHandler.removeClass(this.arrowElement.nativeElement, 'hidden');
            return;
        }

        // this.isHidden = true;
        this.domHandler.addClass(this.arrowElement.nativeElement, 'hidden');
        this.counter == (this.num - 1) ? this.counter = 0 : this.counter++;
    }

    /**
     * ngOnInit
     */
    public ngOnInit() {
        if (this.blinkMode) {

            this.zone.runOutsideAngular(() => {
                this.timer = setInterval(() => {
                    this.showHideArrow();
                }, 2000);
            });
                        
        }
    }

    /**
     * ngOnDestroy
     */
    public ngOnDestroy() {
        if (this.timer) {
            window.clearInterval(this.timer);
        }
    }

    /**
     * ngAfterViewInit
     */
    ngAfterViewInit() {
    }    
    

    /**
     * scrollBodyContainer of widget
     */
    public get scrollBodyContainer() {
        if (this.directiveScroll) {
            return this.directiveScroll.elementRef.nativeElement;
        }
        return null;
    }

    /**
     * scrollToPosition
     */
    scrollToPosition() {
        this.scrollUtils.scrollToPosition(this.mode);        
        switch (this.mode) {
            case 'top':
            case 'bottom':
                this.scrollStatus.top = this.scrollUtils.canScrollUpTop;
                this.scrollStatus.bottom = this.scrollUtils.canScrollDownBottom;
                break;
            case 'left':
            case 'right':
                this.scrollStatus.left = this.scrollUtils.canScrollToLeft;
                this.scrollStatus.right = this.scrollUtils.canScrollToRight;
                break;
        }
        this.onScroll.emit(this.mode);
    }

    /**
     * onWidgetScrollHovering
     * @param evt
     */
    onWidgetScrollHovering() {
        this.scrollUtils.scrollHovering(this.mode);
        this.onScrollHover.emit(this.mode);
    }

    /**
     * onWidgetScrollUnHovering
     * @param evt
     */
    onWidgetScrollUnHovering() {
        this.scrollUtils.scrollUnHovering(this.mode);
        this.onScrollUnHover.emit(this.mode);
    }
}