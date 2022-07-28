import { Injectable } from '@angular/core';
// import * as Ps from 'perfect-scrollbar';
import {
    DomHandler
} from '@app/services';
import { PerfectScrollbarDirective } from 'ngx-perfect-scrollbar';

// @Injectable()
export class ScrollUtils {
    private moveStepScrollPercentage = 0.5;

    constructor(private scrollBodyContainer: HTMLElement, private domHandler: DomHandler) {
        
    }

    /**
     * check hasVerticalScrollof widget
     */
    get hasVerticalScroll() {
        let iRet = false;
        let scrollElem = this.scrollBodyContainer;
        if (scrollElem) {
            iRet = scrollElem.clientHeight < scrollElem.scrollHeight;
        }
        return iRet;
    }

    /**
     * check hasHorizontalScroll widget
     */
    get hasHorizontalScroll() {
        let iRet = false;
        let scrollElem = this.scrollBodyContainer;
        if (scrollElem) {
            iRet = scrollElem.clientWidth < scrollElem.scrollWidth;
        }
        return iRet;
    }

    /**
     * Check if scroll can up to top of widget
     */
    get canScrollUpTop() {
        let iRet = false;
        if (this.hasVerticalScroll) {
            const scrollElem = this.scrollBodyContainer;
            if (scrollElem && scrollElem.scrollTop > 0) {
                iRet = true;
            }
        }
        return iRet;
    }

    /**
     * Check if scroll can down to bottom of widget
     */
    get canScrollDownBottom() {
        let iRet = false;
        if (this.hasVerticalScroll) {
            const scrollElem = this.scrollBodyContainer;
            if (scrollElem) {
                const scrollTopMax = scrollElem.scrollHeight - scrollElem.clientHeight;
                if (Math.ceil(scrollElem.scrollTop) < scrollTopMax) {
                    iRet = true;
                }
            }
        }
        return iRet;
    }

    /**
     * scrollToPosition
     */
    scrollToPosition(mode) {
        switch (mode) {
            case 'top':
            case 'bottom':
                this.scrollToTopBottom(mode);
                break;
            case 'left':
            case 'right':
                this.scrollToLeftRight(mode);
                break;
        }
    }

    /**
     * Check if scroll can move to left of widget
     */
    get canScrollToLeft() {
        let iRet = false;
        if (this.hasHorizontalScroll) {
            const scrollElem: HTMLElement = this.scrollBodyContainer;
            if (scrollElem && scrollElem.scrollLeft > 0) {
                iRet = true;
            }
        }
        return iRet;
    }

    /**
     * Check if scroll can move to right of widget
     */
    get canScrollToRight() {
        let iRet = false;
        if (this.hasHorizontalScroll) {
            const scrollElem: HTMLElement = this.scrollBodyContainer;
            if (scrollElem) {
                const scrollLeftMax = scrollElem.scrollWidth - scrollElem.clientWidth;
                if (Math.ceil(scrollElem.scrollLeft) < scrollLeftMax) {
                    iRet = true;
                }
            }
        }
        return iRet;
    }

    /**
     * scrollToTopBottom
     */
    private scrollToTopBottom(mode) {
        const scrollElem = this.scrollBodyContainer;
        if (scrollElem) {
            const scrollTopMax = scrollElem.scrollHeight - scrollElem.clientHeight;
            const moveStep = Math.round(scrollTopMax * this.moveStepScrollPercentage);
            if (mode == 'bottom') {
                scrollElem.scrollTop += moveStep;
            }
            else {
                scrollElem.scrollTop -= moveStep;
            }
        }
    }

    /**
     * scrollToLeftRight
     */
    private scrollToLeftRight(mode) {
        const scrollElem: HTMLElement = this.scrollBodyContainer;
        if (scrollElem) {
            const scrollLeftMax = scrollElem.scrollWidth - scrollElem.clientWidth;
            const moveStep = Math.round(scrollLeftMax * this.moveStepScrollPercentage);
            if (mode == 'right') {
                $(scrollElem).animate({
                    scrollLeft: scrollElem.scrollLeft + moveStep
                }, 500);
                //scrollElem.scrollLeft += moveStep;
            }
            else {
                $(scrollElem).animate({
                    scrollLeft: scrollElem.scrollLeft - moveStep
                }, 500);
                //scrollElem.scrollLeft -= moveStep;
            }
        }
    }

    /**
     * scrollHovering
     * @param evt
     */
    scrollHovering(mode) {
        if (this.scrollBodyContainer) {
            // (Ps as any).update(this.scrollBodyContainer);
            (this.scrollBodyContainer as any).update();
            let elm;
            switch (mode) {
                case 'left':
                case 'right':
                    elm = $(this.scrollBodyContainer).children('.ps-scrollbar-x-rail');
                    break;
                case 'top':
                case 'bottom':
                    elm = $(this.scrollBodyContainer).children('.ps-scrollbar-y-rail');
                    break;
            }
            if (elm && elm.length) {
                this.domHandler.addClass(elm[0], 'opacity-scroll-visible');
            }
        }
    }

    /**
     * scrollUnHovering
     * @param evt
     */
    scrollUnHovering(mode) {
        if (this.scrollBodyContainer) {
            let elm;
            switch (mode) {
                case 'left':
                case 'right':
                    elm = $(this.scrollBodyContainer).children('.ps-scrollbar-x-rail');
                    break;
                case 'top':
                case 'bottom':
                    elm = $(this.scrollBodyContainer).children('.ps-scrollbar-y-rail');
                    break;
            }
            if (elm && elm.length) {
                this.domHandler.removeClass(elm[0], 'opacity-scroll-visible');
            }
        }
    }   

}
